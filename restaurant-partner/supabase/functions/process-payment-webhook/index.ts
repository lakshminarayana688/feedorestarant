// supabase/functions/process-payment-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { createErrorResponse, createSuccessResponse } from '../_shared/auth.ts';
import { verifyWebhookSignature } from '../_shared/crypto.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const webhookSecret =
    Deno.env.get('PAYMENT_WEBHOOK_SECRET') ||
    Deno.env.get('RAZORPAY_KEY_SECRET') ||
    Deno.env.get('STRIPE_WEBHOOK_SECRET') ||
    'feedo_dev_webhook_secret_key_123';

  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const signature =
      req.headers.get('x-feedo-signature') ||
      req.headers.get('x-razorpay-signature') ||
      req.headers.get('stripe-signature') ||
      req.headers.get('x-stripe-signature') ||
      '';

    const rawBody = await req.text();

    if (!signature) {
      return createErrorResponse('Missing webhook signature header', 401);
    }

    // 1. Verify cryptographic HMAC-SHA256 signature
    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.warn('Tampered payment webhook received. Signature verification failed.');
      return createErrorResponse('Invalid webhook signature', 401);
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (_) {
      return createErrorResponse('Malformed JSON in webhook request body', 400);
    }

    // 2. Extract Event Name and Event ID
    const eventName: string = payload.event || payload.type || '';
    const eventId: string = payload.event_id || payload.id || `evt_${Date.now()}`;

    // 3. Extract Target Order ID from flexible payload layouts (Razorpay, Stripe, Standard)
    const orderId: string =
      payload.data?.order_id ||
      payload.data?.object?.metadata?.order_id ||
      payload.payload?.payment?.entity?.notes?.order_id ||
      payload.payload?.order?.entity?.notes?.order_id ||
      payload.order_id ||
      '';

    if (!eventName || !orderId) {
      return createErrorResponse('Malformed webhook payload: missing event or target order_id', 422);
    }

    // 4. Map Event to authoritative Payment Status
    let nextPaymentStatus: PaymentStatus;
    if (
      [
        'payment.captured',
        'order.paid',
        'payment_intent.succeeded',
        'charge.succeeded',
        'checkout.session.completed',
      ].includes(eventName)
    ) {
      nextPaymentStatus = 'PAID';
    } else if (
      [
        'payment.authorized',
        'payment_intent.amount_capturable_updated',
      ].includes(eventName)
    ) {
      nextPaymentStatus = 'AUTHORIZED';
    } else if (
      [
        'payment.failed',
        'payment_intent.payment_failed',
        'charge.failed',
      ].includes(eventName)
    ) {
      nextPaymentStatus = 'FAILED';
    } else if (
      [
        'refund.processed',
        'refund.created',
        'charge.refunded',
        'payment_intent.refunded',
      ].includes(eventName)
    ) {
      nextPaymentStatus = 'REFUNDED';
    } else {
      // Ignored non-payment lifecycle events (e.g. payout.initiated)
      return createSuccessResponse({
        message: `Event '${eventName}' received and ignored`,
        event_id: eventId,
      });
    }

    // 5. Verify Order Existence in database
    const { data: currentOrder, error: fetchErr } = await adminClient
      .from('orders')
      .select('id, restaurant_id, total_amount, payment_status, payment_method, status')
      .eq('id', orderId)
      .single();

    if (fetchErr || !currentOrder) {
      return createErrorResponse(`Order '${orderId}' not found`, 404);
    }

    // 6. Webhook Idempotency Check in Audit Logs
    const { data: existingLog } = await adminClient
      .from('audit_logs')
      .select('id, created_at')
      .eq('action', 'PAYMENT_WEBHOOK_PROCESSED')
      .eq('resource_id', orderId)
      .contains('metadata', { event_id: eventId })
      .maybeSingle();

    if (existingLog) {
      return createSuccessResponse({
        message: 'Webhook already processed (idempotent)',
        event_id: eventId,
        order_id: orderId,
        payment_status: currentOrder.payment_status,
      });
    }

    // 7. Duplicate Payment Protection
    // If order is already PAID and a duplicate success event or callback arrives for another payment attempt:
    if (currentOrder.payment_status === 'PAID' && nextPaymentStatus === 'PAID') {
      await adminClient.from('audit_logs').insert({
        restaurant_id: currentOrder.restaurant_id,
        action: 'PAYMENT_WEBHOOK_DUPLICATE_IGNORED',
        resource_type: 'orders',
        resource_id: orderId,
        metadata: {
          event: eventName,
          event_id: eventId,
          note: 'Duplicate payment callback received for already PAID order',
        },
      });

      return createSuccessResponse({
        message: 'Order is already marked PAID (duplicate callback ignored)',
        order_id: orderId,
        payment_status: 'PAID',
        idempotent: true,
      });
    }

    // Extract payment method and gateway reference IDs
    const paymentMethod =
      payload.data?.payment_method ||
      payload.data?.object?.payment_method_types?.[0]?.toUpperCase() ||
      payload.payload?.payment?.entity?.method?.toUpperCase() ||
      currentOrder.payment_method ||
      'UPI';

    const gatewayPaymentId =
      payload.data?.payment_id ||
      payload.data?.object?.id ||
      payload.payload?.payment?.entity?.id ||
      null;

    const failureReason =
      payload.data?.error_description ||
      payload.data?.object?.last_payment_error?.message ||
      payload.payload?.payment?.entity?.error_description ||
      null;

    // 8. Update Order Payment Status via Service Role
    const { data: updatedOrder, error: orderErr } = await adminClient
      .from('orders')
      .update({
        payment_status: nextPaymentStatus,
        payment_method: paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('id, restaurant_id, total_amount, payment_status, payment_method')
      .single();

    if (orderErr || !updatedOrder) {
      return createErrorResponse(`Failed to update payment status for order '${orderId}'`, 500);
    }

    // 9. Write Immutable Audit Trail
    await adminClient.from('audit_logs').insert({
      restaurant_id: updatedOrder.restaurant_id,
      action: 'PAYMENT_WEBHOOK_PROCESSED',
      resource_type: 'orders',
      resource_id: orderId,
      metadata: {
        event: eventName,
        event_id: eventId,
        previous_payment_status: currentOrder.payment_status,
        new_payment_status: nextPaymentStatus,
        gateway_payment_id: gatewayPaymentId,
        failure_reason: failureReason,
        amount: payload.data?.amount || currentOrder.total_amount,
      },
    });

    return createSuccessResponse({
      order_id: orderId,
      payment_status: nextPaymentStatus,
      payment_method: paymentMethod,
      gateway_payment_id: gatewayPaymentId,
      processed: true,
    });
  } catch (err: any) {
    console.error('Unhandled payment webhook exception:', err);
    return createErrorResponse('Internal error processing payment gateway webhook', 500);
  }
});

