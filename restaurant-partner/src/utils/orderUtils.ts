/**
 * Utility functions for Order Pickup Verification & Unique Code Generation
 */

export interface OrderWithPickupCode {
  id?: string;
  pickupCode?: string;
  status?: string;
}

/**
 * Generates a unique, high-entropy 4-digit numeric pickup code (1000 - 9999)
 * guaranteed not to collide with any currently active order.
 */
export function generateUniquePickupCode(existingOrders: OrderWithPickupCode[]): string {
  const activeCodes = new Set<string>();

  for (const order of existingOrders) {
    // Only track codes of orders that are not terminal (not delivered/cancelled)
    if (
      order.pickupCode &&
      order.status !== 'DELIVERED' &&
      order.status !== 'CUSTOMER_CANCELLED' &&
      order.status !== 'RESTAURANT_REJECTED'
    ) {
      activeCodes.add(order.pickupCode.trim());
    }
  }

  let code = '';
  let attempts = 0;
  do {
    // Generate 4-digit integer between 1000 and 9999
    code = Math.floor(1000 + Math.random() * 9000).toString();
    attempts++;
  } while (activeCodes.has(code) && attempts < 2000);

  return code;
}

/**
 * Validates whether an entered pickup code matches the expected code for an order.
 * Requires strict 4-digit match and trims whitespace.
 */
export function validatePickupCode(enteredCode: string | undefined | null, expectedCode: string): {
  valid: boolean;
  error?: string;
} {
  if (!enteredCode || !enteredCode.trim()) {
    return { valid: false, error: 'INVALID PICKUP CODE: 4-digit code is required.' };
  }

  const cleanEntered = enteredCode.trim();
  const cleanExpected = expectedCode.trim();

  if (!/^\d{4}$/.test(cleanEntered)) {
    return { valid: false, error: 'INVALID PICKUP CODE: Code must be exactly 4 digits.' };
  }

  if (cleanEntered !== cleanExpected) {
    return { valid: false, error: 'INVALID PICKUP CODE: Incorrect 4-digit code entered.' };
  }

  return { valid: true };
}
