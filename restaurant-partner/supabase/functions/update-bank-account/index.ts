// supabase/functions/update-bank-account/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { authenticateAndAuthorize, createErrorResponse, createSuccessResponse } from '../_shared/auth.ts';
import { encryptSensitiveData, getLast4, maskBankAccount } from '../_shared/crypto.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const body = await req.json();
    const { restaurant_id, account_holder_name, bank_name, account_number, ifsc_code } = body;

    if (!restaurant_id || !account_holder_name || !bank_name || !account_number || !ifsc_code) {
      return createErrorResponse('Missing required bank fields', 422);
    }

    // Must be OWNER of the restaurant
    const authContext = await authenticateAndAuthorize(req, {
      requiredRestaurantId: restaurant_id,
      allowedRoles: ['OWNER'],
    });
    if (authContext instanceof Response) return authContext;

    const { adminClient, userId } = authContext;

    // Validate Account Number (9 to 18 digits)
    const cleanAccount = account_number.trim().replace(/\s+/g, '');
    if (!/^\d{9,18}$/.test(cleanAccount)) {
      return createErrorResponse('Invalid bank account number. Must be between 9 and 18 digits', 422);
    }

    // Validate IFSC Code (11 alphanumeric, e.g. HDFC0000053)
    const cleanIfsc = ifsc_code.trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      return createErrorResponse('Invalid IFSC code format (e.g. HDFC0000053)', 422);
    }

    // Encrypt sensitive banking fields
    const encryptionKey = Deno.env.get('BANK_ENCRYPTION_KEY') || 'feedo_default_bank_secret_key_32!';
    const encryptedAccount = await encryptSensitiveData(cleanAccount, encryptionKey);
    const encryptedIfsc = await encryptSensitiveData(cleanIfsc, encryptionKey);
    const accountLast4 = getLast4(cleanAccount);

    // Upsert restaurant_bank_accounts
    const { data: bankRecord, error: bankErr } = await adminClient
      .from('restaurant_bank_accounts')
      .insert({
        restaurant_id,
        account_holder_name: account_holder_name.trim(),
        bank_name: bank_name.trim(),
        account_number_encrypted: encryptedAccount,
        ifsc_code_encrypted: encryptedIfsc,
        account_last4: accountLast4,
        verification_status: 'pending',
        is_primary: true,
      })
      .select('id, restaurant_id, account_holder_name, bank_name, account_last4, verification_status, is_primary, created_at')
      .single();

    if (bankErr) {
      console.error('Bank account update error:', bankErr);
      return createErrorResponse('Failed to update bank details', 500);
    }

    // Audit Log (Notice: NEVER log full bank account number)
    await adminClient.from('audit_logs').insert({
      user_id: userId,
      restaurant_id,
      action: 'BANK_ACCOUNT_CHANGED',
      resource_type: 'restaurant_bank_accounts',
      resource_id: bankRecord.id,
      metadata: {
        bank_name: bank_name.trim(),
        account_holder: account_holder_name.trim(),
        account_masked: maskBankAccount(cleanAccount),
        ifsc_prefix: cleanIfsc.slice(0, 4),
      },
    });

    return createSuccessResponse(bankRecord, 201);
  } catch (err: any) {
    console.error('Unhandled update-bank-account exception:', err);
    return createErrorResponse('An internal error occurred while updating bank details', 500);
  }
});
