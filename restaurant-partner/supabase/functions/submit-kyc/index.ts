// supabase/functions/submit-kyc/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { authenticateAndAuthorize, createErrorResponse, createSuccessResponse } from '../_shared/auth.ts';
import { encryptSensitiveData, getLast4, maskPAN } from '../_shared/crypto.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const body = await req.json();
    const { restaurant_id, pan_number, gst_number, fssai_number, fssai_expiry_date } = body;

    if (!restaurant_id || !pan_number || !fssai_number) {
      return createErrorResponse('Missing required KYC fields (restaurant_id, pan_number, fssai_number)', 422);
    }

    // Must be OWNER of the restaurant
    const authContext = await authenticateAndAuthorize(req, {
      requiredRestaurantId: restaurant_id,
      allowedRoles: ['OWNER'],
    });
    if (authContext instanceof Response) return authContext;

    const { adminClient, userId } = authContext;

    // Validate PAN Format (Indian PAN: 5 letters, 4 digits, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const cleanPan = pan_number.trim().toUpperCase();
    if (!panRegex.test(cleanPan)) {
      return createErrorResponse('Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F)', 422);
    }

    // Validate FSSAI (14 digits)
    const fssaiRegex = /^[0-9]{14}$/;
    const cleanFssai = fssai_number.trim();
    if (!fssaiRegex.test(cleanFssai)) {
      return createErrorResponse('Invalid FSSAI number. Must be exactly 14 digits', 422);
    }

    // Encrypt PAN with encryption key
    const encryptionKey = Deno.env.get('KYC_ENCRYPTION_KEY') || 'feedo_default_kyc_secret_key_32b!';
    const encryptedPan = await encryptSensitiveData(cleanPan, encryptionKey);
    const panLast4 = getLast4(cleanPan);

    // Upsert restaurant_kyc
    const { data: kycRecord, error: kycError } = await adminClient
      .from('restaurant_kyc')
      .upsert({
        restaurant_id,
        pan_number_encrypted: encryptedPan,
        pan_last4: panLast4,
        gst_number: gst_number ? gst_number.trim().toUpperCase() : null,
        fssai_number: cleanFssai,
        fssai_expiry_date: fssai_expiry_date || null,
        verification_status: 'under_review',
        submitted_at: new Date().toISOString(),
      }, { onConflict: 'restaurant_id' })
      .select('id, restaurant_id, pan_last4, gst_number, fssai_number, verification_status, submitted_at')
      .single();

    if (kycError) {
      console.error('KYC submission error:', kycError);
      return createErrorResponse('Failed to submit KYC data', 500);
    }

    // Update restaurant verification status to under_review
    await adminClient
      .from('restaurants')
      .update({ verification_status: 'under_review' })
      .eq('id', restaurant_id);

    // Record Audit Log (Notice: NEVER log raw PAN)
    await adminClient.from('audit_logs').insert({
      user_id: userId,
      restaurant_id,
      action: 'KYC_SUBMITTED',
      resource_type: 'restaurant_kyc',
      resource_id: kycRecord.id,
      metadata: {
        fssai_number: cleanFssai,
        pan_masked: maskPAN(cleanPan),
        verification_status: 'under_review',
      },
    });

    return createSuccessResponse(kycRecord, 201);
  } catch (err: any) {
    console.error('Unhandled submit-kyc exception:', err);
    return createErrorResponse('An internal error occurred while processing KYC submission', 500);
  }
});
