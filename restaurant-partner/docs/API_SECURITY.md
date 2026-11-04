# FEEDO Restaurant Partner — Edge Functions & API Security Specification

## 1. Global API Standards

### 1.1 Authentication & Header Requirements
Every authenticated API call must provide the following HTTP headers:
```http
Authorization: Bearer <SUPABASE_JWT_ACCESS_TOKEN>
x-restaurant-id: <RESTAURANT_UUID>
Content-Type: application/json
```

### 1.2 Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-09-24T14:45:00.000Z"
}
```

### 1.3 Standard Error Response (Safe Errors — No Stack Leaks)
```json
{
  "success": false,
  "error": "Access denied: You are not authorized for this restaurant",
  "timestamp": "2026-09-24T14:45:00.000Z"
}
```

---

## 2. API Endpoints Catalog

### 2.1 `POST /create-restaurant`
* **Authorization**: Authenticated user (`auth.uid()`).
* **Description**: Initializes a restaurant and binds user as `OWNER` in `restaurant_users`.
* **Request Body**:
  ```json
  {
    "name": "Lucky Family Restaurant",
    "legal_name": "Lucky Family Foods Pvt Ltd",
    "phone": "+91 98765 43210",
    "email": "lucky.family.blr@feedopartner.com",
    "restaurant_type": "Restaurant",
    "cuisines": ["Biryani", "North Indian"],
    "address": "No. 42, 80 Feet Road, 4th Block, Koramangala",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560034"
  }
  ```

---

### 2.2 `POST /submit-kyc`
* **Authorization**: `OWNER` role only.
* **Description**: Encrypts PAN, validates FSSAI (14 digits), and submits for FEEDO review.
* **Request Body**:
  ```json
  {
    "restaurant_id": "a0000000-0000-0000-0000-000000000001",
    "pan_number": "AABCL9921D",
    "gst_number": "29AABCL9921D1Z8",
    "fssai_number": "21223004000891",
    "fssai_expiry_date": "2028-12-31"
  }
  ```
* **Security Output**: Returns masked `pan_last4: "921D"`. Raw PAN is never returned.

---

### 2.3 `POST /update-bank-account`
* **Authorization**: `OWNER` role only.
* **Description**: Encrypts account number and IFSC, stores `account_last4`, generates audit record.
* **Request Body**:
  ```json
  {
    "restaurant_id": "a0000000-0000-0000-0000-000000000001",
    "account_holder_name": "Lakshmi Narayana",
    "bank_name": "HDFC Bank - Koramangala",
    "account_number": "5010023489921",
    "ifsc_code": "HDFC0000053"
  }
  ```
* **Security Output**: Returns `account_last4: "9921"`. Full account number is never logged or exposed.

---

### 2.4 `POST /create-order`
* **Authorization**: Public / Customer client.
* **Description**: Verifies restaurant is approved and active. Snapshots menu items from database to prevent price tampering.
* **Request Body**:
  ```json
  {
    "restaurant_id": "a0000000-0000-0000-0000-000000000001",
    "customer_name": "Rahul Kumar",
    "customer_phone": "+91 98765 43210",
    "customer_address": "Flat 402, Green Glen Layout, Bellandur, Bengaluru",
    "items": [
      {
        "menu_item_id": "e0000000-0000-0000-0000-000000000001",
        "quantity": 2,
        "special_instructions": "Less spicy"
      }
    ],
    "payment_method": "UPI"
  }
  ```

---

### 2.5 `POST /update-order-status`
* **Authorization**: `OWNER`, `MANAGER`, `STAFF`, `KITCHEN`, `CASHIER`.
* **Description**: Validates user role permission and enforces the state machine.
* **Request Body**:
  ```json
  {
    "order_id": "FD10245",
    "restaurant_id": "a0000000-0000-0000-0000-000000000001",
    "next_status": "READY",
    "pickup_code": "7284"
  }
  ```

---

### 2.6 `POST /process-payment-webhook`
* **Authorization**: Cryptographic HMAC-SHA256 signature in `x-feedo-signature` header.
* **Description**: Verifies webhook authenticity, checks idempotency against duplicate payloads, updates payment status.
* **Headers**:
  ```http
  x-feedo-signature: 8d9e2f47a1bc...
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "event": "payment.captured",
    "event_id": "evt_99812401",
    "data": {
      "order_id": "FD10245",
      "amount": 470.00,
      "payment_method": "UPI"
    }
  }
  ```

---

### 2.7 `POST /create-payout`
* **Authorization**: `OWNER` role only.
* **Description**: Calculates gross, commission, tax, and net payout with idempotency protection.
* **Request Body**:
  ```json
  {
    "restaurant_id": "a0000000-0000-0000-0000-000000000001",
    "period_start": "2026-09-23",
    "period_end": "2026-09-23"
  }
  ```

---

### 2.8 `GET /audit-log`
* **Authorization**: `OWNER` or `MANAGER` role.
* **Description**: Retrieves audit trail with redacted metadata.
* **Query Parameters**: `?restaurant_id=<UUID>&limit=50&action=ORDER_STATUS_CHANGED`
