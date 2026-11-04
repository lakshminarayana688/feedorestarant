# FEEDO Restaurant Partner — Master Security Specification

## 1. Executive Summary
The **FEEDO Restaurant Partner** platform employs a **Zero-Trust Defense-in-Depth** architecture. Every layer of the stack—from the frontend user interface and API gateways down to the PostgreSQL storage engine—autonomously enforces identity verification, tenant boundary isolation, role-based permissions, and cryptographic data protection.

---

## 2. Core Security Principles
* **Never Trust the Client**: Client-side state, form fields, and JavaScript variables are treated as untrusted input.
* **Defense in Depth**: Every operation is validated at 3 distinct checkpoints:
  1. Frontend Client (UX and input formatting)
  2. Edge Functions / API Middleware (Session, RBAC, and payload schema validation)
  3. Database Engine (PostgreSQL Row-Level Security, Constraints, and Trigger State-Machines)
* **Least Privilege Access**: Users, services, and database connections operate with the minimum permissions needed for their defined role.
* **Explicit Tenant Isolation**: No entity assumes `auth.uid() = restaurant_id`. Membership is explicitly verified through `restaurant_users`.

---

## 3. Threat Model & Data Classification

| Classification | Data Types | Security Controls |
| :--- | :--- | :--- |
| **Restricted (Critical)** | PAN numbers, Bank account numbers, IFSC codes, Webhook secrets, Service keys | AES-256 / `pgcrypto` column encryption, masked output (`XXXXXX9921`), `OWNER`-only RLS, strict audit logging. |
| **Confidential** | Daily sales, payouts, commission fees, FSSAI certificates, customer delivery addresses | Private Supabase Storage buckets, Signed temporary URLs, RLS tenant isolation. |
| **Internal / Operational** | Active order items, preparation status, kitchen timers, rider details | Member-scoped RLS, real-time WebSocket tenant channel filtering. |
| **Public** | Menu items, item prices, restaurant name, public cuisine categories | Public read access, authenticated member write/update access. |

---

## 4. Authentication Architecture
1. **Supabase Auth Engine**: Manages user registration, login, JWT token issuance, and password hashing (Argon2/bcrypt).
2. **Short-Lived JWTs**: Access tokens expire in 3600 seconds (1 hour). Refresh tokens are managed via secure HTTP-only cookies or encrypted local storage.
3. **Multi-Tenant User Flow**:
   ```mermaid
   graph TD
     Auth[auth.users] -->|1:1| Profile[public.profiles]
     Auth -->|1:N| RU[public.restaurant_users]
     RU -->|N:1| Rest[public.restaurants]
   ```

---

## 5. Role-Based Access Control (RBAC) Matrix

| Feature / Operation | OWNER | MANAGER | STAFF | KITCHEN | CASHIER |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Create Restaurant & KYC** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View/Edit Bank Account** | ✅ (Encrypted) | ❌ | ❌ | ❌ | ❌ |
| **View Financial Settlements** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Staff Roles** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Menu Items & Prices** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Toggle Menu Item Availability** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Accept / Reject Orders** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Update Kitchen Prep / Ready** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Verify Pickup OTP & Handover** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **View Customer Addresses** | ✅ | ✅ | ✅ | ❌ (Masked) | ❌ (Masked) |
| **View Tamper-Evident Audit Logs**| ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 6. Row Level Security (RLS) Strategy
Every single table in the database has RLS explicitly enabled:
* **Helper Functions**:
  * `public.is_restaurant_member(restaurant_id UUID)`
  * `public.has_restaurant_role(restaurant_id UUID, allowed_roles restaurant_user_role[])`
  * `public.is_restaurant_owner(restaurant_id UUID)`
* **Strict Tenant Scoping**:
  ```sql
  CREATE POLICY "Members can view their restaurant orders"
  ON public.orders FOR SELECT
  USING (public.is_restaurant_member(restaurant_id));
  ```

---

## 7. Cryptographic Protection & Sensitive Data
* **PAN & Bank Accounts**: Stored in `restaurant_kyc.pan_number_encrypted` and `restaurant_bank_accounts.account_number_encrypted` using AES-GCM / `pgcrypto`.
* **Last 4 Digits**: Stored in unencrypted `pan_last4` and `account_last4` for safe frontend display without decrypting the master key.
* **Customer Phone Privacy**: Masked in database snapshots as `+91 98*** **210`.

---

## 8. Order Lifecycle State Machine
Order state transitions are strictly governed by the database trigger `trg_validate_order_status`:
```
PLACED ──> ACCEPTED ──> PREPARING ──> READY ──> PICKED_UP ──> DELIVERED
   │           │            │           │           │
   └── REJECTED└── CANCELLED └── CANCELLED── CANCELLED└── CANCELLED
```
* **Illegal Backward Transitions**: Transitions like `DELIVERED -> PREPARING` or `PICKED_UP -> ACCEPTED` throw a PostgreSQL exception and rollback the transaction.

---

## 9. Webhook & Payment Security
* **HMAC-SHA256 Signature Verification**: In `process-payment-webhook`, the raw payload is verified against the shared secret before processing.
* **Idempotency Protection**: Every webhook event is checked in `audit_logs` against `metadata->>'event_id'`. Duplicate delivery attempts return `200 OK` without re-executing business logic.

---

## 10. Audit Logging & Compliance
* All state changes (logins, KYC submissions, bank account modifications, order updates, payout triggers) are written to `public.audit_logs`.
* Audit logs store actor `user_id`, `restaurant_id`, `action`, `resource_type`, `metadata` (with sensitive fields redacted), client IP, and user-agent.
* Audit records are immutable (no updates or deletes permitted by client policies).

---

## 11. Security Headers Configuration
For web deployments, the following HTTP response headers are enforced:
```
Content-Security-Policy: default-src 'self' https: data: blob: 'unsafe-inline';
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```
