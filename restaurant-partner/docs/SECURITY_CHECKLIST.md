# FEEDO Restaurant Partner — Master Security Checklist

| Category | Security Requirement | Status | Verification Detail |
| :--- | :--- | :---: | :--- |
| **AUTH** | Authentication managed solely via Supabase Auth (no raw password storage) | **PASS** | Managed Argon2/bcrypt password hashing + JWT token issuance. |
| **AUTH** | Session expiry & short-lived access tokens (1 hr) | **PASS** | Configured in Supabase Auth JWT config. |
| **RBAC** | Dedicated `restaurant_users` multi-tenant table | **PASS** | Separation of `auth.users`, `profiles`, `restaurant_users`, and `restaurants`. |
| **RBAC** | Role hierarchy (`OWNER`, `MANAGER`, `STAFF`, `KITCHEN`, `CASHIER`) | **PASS** | Enforced at DB RLS and Edge Function middleware levels. |
| **RLS** | RLS enabled on all 12 tables | **PASS** | Explicit `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in migration. |
| **RLS** | Tenant isolation prevents Restaurant A reading Restaurant B's data | **PASS** | `is_restaurant_member(restaurant_id)` used in all SELECT/UPDATE policies. |
| **DATABASE** | Schema version control through migrations | **PASS** | Migrations structured in `supabase/migrations/`. |
| **DATABASE** | Server-side triggers preventing invalid order status transitions | **PASS** | Trigger `trg_validate_order_status` rejects invalid state jumps. |
| **STORAGE** | Private storage bucket for KYC & compliance documents | **PASS** | `restaurant-kyc` and `restaurant-documents` buckets are `public: false`. |
| **STORAGE** | Signed temporary URLs for document access | **PASS** | Storage RLS permits only authenticated owners/managers to read files. |
| **KYC** | PAN encrypted with AES-GCM / `pgcrypto` | **PASS** | `restaurant_kyc.pan_number_encrypted` + `pan_last4` for safe frontend display. |
| **KYC** | Kitchen/Staff/Cashier blocked from accessing KYC | **PASS** | RLS policy `Only Owners can view KYC data`. |
| **BANKING** | Bank account numbers encrypted | **PASS** | `account_number_encrypted` + `account_last4` used for UI. |
| **BANKING** | Audit logging on bank account updates | **PASS** | `BANK_ACCOUNT_CHANGED` event logged with full number redacted. |
| **PAYMENTS** | Server-side webhook HMAC-SHA256 signature verification | **PASS** | `verifyWebhookSignature` in `process-payment-webhook`. |
| **PAYMENTS** | Webhook idempotency protection against duplicate events | **PASS** | Verified against `event_id` in `audit_logs`. |
| **PAYOUTS** | Client blocked from directly marking payouts as COMPLETED | **PASS** | Payout updates restricted to Service Role / Edge Function. |
| **PAYOUTS** | Idempotency protection for daily settlements | **PASS** | Unique `settlement_reference` index and period checks. |
| **AUDIT LOGS** | Immutable audit trail for all sensitive operations | **PASS** | Inserted on KYC, Bank, Order, Restaurant, and Payout mutations. |
| **AUDIT LOGS** | No raw PAN, Bank, Password, or OTP in logs | **PASS** | Masking helpers `maskPAN` and `maskBankAccount` enforced. |
| **FILE UPLOADS** | MIME type and file size restrictions | **PASS** | Configured in `storage.buckets` (max 10MB, PDF/JPG/PNG only). |
| **SECRETS** | Service role key excluded from client bundle | **PASS** | Stored only in backend environment variables (`.env`). |
| **HEADERS** | Production security headers (CSP, HSTS, X-Frame-Options) | **PASS** | Configured in `vercel.json` and meta tags. |
| **REALTIME** | Realtime subscriptions isolated by tenant | **PASS** | Protected by Supabase PostgreSQL Realtime RLS. |
| **ERROR HANDLING** | Sanitized error messages (no stack traces or SQL dumps) | **PASS** | Uniform `createErrorResponse` helper across all endpoints. |
