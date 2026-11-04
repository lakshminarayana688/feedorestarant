// supabase/functions/_shared/crypto.ts

/**
 * Mask customer phone number e.g. "+91 98765 43210" -> "+91 98*** **210"
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return '******';
  const clean = phone.trim();
  const start = clean.slice(0, 5);
  const end = clean.slice(-3);
  return `${start}*** **${end}`;
}

/**
 * Mask PAN number e.g. "ABCDE1234F" -> "XXXXXX1234"
 */
export function maskPAN(pan: string): string {
  if (!pan || pan.length < 4) return 'XXXXXX';
  const last4 = pan.slice(-4);
  return `XXXXXX${last4}`;
}

/**
 * Mask Bank Account Number e.g. "5010023489921" -> "XXXXXX9921"
 */
export function maskBankAccount(account: string): string {
  if (!account || account.length < 4) return 'XXXX';
  const last4 = account.slice(-4);
  return `XXXXXX${last4}`;
}

/**
 * Extract last 4 alphanumeric characters
 */
export function getLast4(str: string): string {
  if (!str) return 'XXXX';
  return str.trim().slice(-4);
}

/**
 * Simple AES-GCM Encrypt string using an encryption secret key
 */
export async function encryptSensitiveData(plainText: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey.padEnd(32, '0').slice(0, 32));
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoder.encode(plainText)
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify HMAC-SHA256 signature for Payment Webhooks (Razorpay, Stripe, Cashfree, FEEDO)
 */
export async function verifyWebhookSignature(
  rawPayload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    if (!signature || !secret || !rawPayload) return false;
    const encoder = new TextEncoder();

    // Check if Stripe signature format (e.g. t=1614555845,v1=5257a869e7...)
    if (signature.includes('t=') && signature.includes('v1=')) {
      const parts = signature.split(',').reduce((acc: Record<string, string>, item) => {
        const [k, v] = item.trim().split('=');
        if (k && v) acc[k] = v;
        return acc;
      }, {});

      const timestamp = parts['t'];
      const stripeSig = parts['v1'];
      if (!timestamp || !stripeSig) return false;

      const signedPayload = `${timestamp}.${rawPayload}`;
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const calculatedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
      const hexSig = Array.from(new Uint8Array(calculatedSig))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return timingSafeEqual(hexSig.toLowerCase(), stripeSig.toLowerCase());
    }

    // Standard HMAC-SHA256 (Razorpay / Cashfree / Standard)
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const calculatedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(rawPayload));
    const hexSig = Array.from(new Uint8Array(calculatedSig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return timingSafeEqual(hexSig.toLowerCase(), signature.toLowerCase().trim());
  } catch (err) {
    console.error('Webhook signature verification error:', err);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

