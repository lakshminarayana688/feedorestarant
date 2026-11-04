# FEEDO Restaurant Partner — Database Specification & Schema

## 1. Schema Tables Overview

### 1.1 `public.profiles`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY REFERENCES auth.users(id)` | User auth ID |
| `full_name` | `TEXT` | `NOT NULL` | User full name |
| `email` | `TEXT` | `UNIQUE NOT NULL` | Verified email |
| `phone` | `TEXT` | | Contact number |
| `avatar_url` | `TEXT` | | Profile photo |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Auto-updated timestamp |

---

### 1.2 `public.restaurants`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique restaurant ID |
| `owner_id` | `UUID` | `REFERENCES auth.users(id)` | Restaurant creator/owner |
| `name` | `TEXT` | `NOT NULL` | Brand/Display name |
| `legal_name` | `TEXT` | `NOT NULL` | Registered business name |
| `phone` | `TEXT` | `NOT NULL` | Official phone number |
| `email` | `TEXT` | `NOT NULL` | Official email address |
| `restaurant_type` | `TEXT` | `NOT NULL DEFAULT 'Restaurant'` | Cafe, Cloud Kitchen, etc. |
| `cuisines` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Supported cuisines |
| `address` | `TEXT` | `NOT NULL` | Street address |
| `city` | `TEXT` | `NOT NULL DEFAULT 'Bengaluru'` | City |
| `state` | `TEXT` | `NOT NULL DEFAULT 'Karnataka'` | State |
| `pincode` | `TEXT` | `NOT NULL` | Postal PIN code |
| `latitude` | `NUMERIC(10,7)` | | Geographical latitude |
| `longitude` | `NUMERIC(10,7)` | | Geographical longitude |
| `status` | `restaurant_status` | `NOT NULL DEFAULT 'pending'` | `pending`, `active`, `suspended`, `closed` |
| `verification_status`| `verification_status`| `NOT NULL DEFAULT 'pending'` | `pending`, `under_review`, `approved`, `rejected` |
| `is_online` | `BOOLEAN` | `NOT NULL DEFAULT false` | Online/Offline toggle |
| `auto_accept_orders`| `BOOLEAN` | `NOT NULL DEFAULT false` | Auto accept toggle |
| `new_order_sound` | `BOOLEAN` | `NOT NULL DEFAULT true` | Audio chime toggle |
| `rating` | `NUMERIC(3,2)` | `DEFAULT 4.80` | Customer review score |
| `total_reviews` | `INT` | `DEFAULT 0` | Total review count |

---

### 1.3 `public.restaurant_users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Membership ID |
| `restaurant_id` | `UUID` | `NOT NULL REFERENCES public.restaurants(id)` | Restaurant foreign key |
| `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id)` | Staff member user ID |
| `role` | `restaurant_user_role`| `NOT NULL DEFAULT 'STAFF'` | `OWNER`, `MANAGER`, `STAFF`, `KITCHEN`, `CASHIER` |
| `status` | `user_membership_status`| `NOT NULL DEFAULT 'active'` | `active`, `invited`, `suspended` |

---

### 1.4 `public.restaurant_kyc`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | KYC ID |
| `restaurant_id` | `UUID` | `UNIQUE NOT NULL REFERENCES public.restaurants(id)` | Restaurant foreign key |
| `pan_number_encrypted` | `TEXT` | `NOT NULL` | AES-256 encrypted PAN |
| `pan_last4` | `TEXT` | `NOT NULL` | Safe last 4 characters for UI |
| `gst_number` | `TEXT` | | GST identification number |
| `fssai_number` | `TEXT` | `NOT NULL` | 14-digit FSSAI license |
| `fssai_expiry_date` | `DATE` | | License validity date |
| `verification_status`| `verification_status`| `NOT NULL DEFAULT 'pending'` | KYC audit state |
| `rejection_reason` | `TEXT` | | Reason if rejected |
| `submitted_at` | `TIMESTAMPTZ` | | Submission timestamp |
| `verified_at` | `TIMESTAMPTZ` | | Approval timestamp |

---

### 1.5 `public.restaurant_bank_accounts`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Bank record ID |
| `restaurant_id` | `UUID` | `NOT NULL REFERENCES public.restaurants(id)` | Restaurant foreign key |
| `account_holder_name`| `TEXT` | `NOT NULL` | Name on bank account |
| `bank_name` | `TEXT` | `NOT NULL` | Bank branch name |
| `account_number_encrypted`| `TEXT` | `NOT NULL` | AES-256 encrypted account |
| `ifsc_code_encrypted`| `TEXT` | `NOT NULL` | AES-256 encrypted IFSC |
| `account_last4` | `TEXT` | `NOT NULL` | Last 4 digits (e.g. `9921`) |
| `verification_status`| `verification_status`| `NOT NULL DEFAULT 'pending'` | Penny drop / verification status |
| `is_primary` | `BOOLEAN` | `DEFAULT true` | Primary payout account |

---

### 1.6 `public.orders`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` (e.g. `'FD10245'`) | Order tracking number |
| `restaurant_id` | `UUID` | `NOT NULL REFERENCES public.restaurants(id)` | Restaurant foreign key |
| `customer_name_snapshot` | `TEXT` | `NOT NULL` | Customer name at time of order |
| `customer_phone_masked` | `TEXT` | `NOT NULL` | Masked phone (`+91 98*** **210`) |
| `customer_address_snapshot` | `TEXT` | `NOT NULL` | Delivery address snapshot |
| `order_number` | `TEXT` | `NOT NULL` | Display number (`#FD10245`) |
| `status` | `order_status` | `NOT NULL DEFAULT 'PLACED'` | Strict state machine enum |
| `subtotal` | `NUMERIC(10,2)` | `NOT NULL CHECK (subtotal >= 0)` | Food subtotal |
| `delivery_fee` | `NUMERIC(10,2)` | `DEFAULT 0` | Rider delivery fee |
| `platform_fee` | `NUMERIC(10,2)` | `DEFAULT 10` | Platform service charge |
| `tax` | `NUMERIC(10,2)` | `DEFAULT 0` | 5% GST on food |
| `discount` | `NUMERIC(10,2)` | `DEFAULT 0` | Coupon discount |
| `total_amount` | `NUMERIC(10,2)` | `NOT NULL CHECK (total_amount >= 0)` | Final paid amount |
| `payment_status`| `order_payment_status`| `DEFAULT 'PENDING'` | `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| `payment_method`| `TEXT` | `DEFAULT 'UPI'` | UPI, Card, NetBanking, COD |
| `pickup_code` | `TEXT` | `NOT NULL` | 4-digit handover OTP |
| `prep_minutes` | `INT` | `DEFAULT 18` | Kitchen preparation target |

---

### 1.7 `public.order_items`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Line item ID |
| `order_id` | `TEXT` | `NOT NULL REFERENCES public.orders(id)` | Order foreign key |
| `menu_item_id` | `UUID` | `REFERENCES public.menu_items(id)` | Menu item link |
| `item_name_snapshot`| `TEXT` | `NOT NULL` | Item title at order time |
| `quantity` | `INT` | `NOT NULL CHECK (quantity > 0)` | Units ordered |
| `unit_price` | `NUMERIC(10,2)` | `NOT NULL` | Unit price at order time |
| `total_price` | `NUMERIC(10,2)` | `NOT NULL` | `unit_price * quantity` |
| `is_veg` | `BOOLEAN` | `NOT NULL DEFAULT true` | Vegetarian flag |
| `special_instructions` | `TEXT` | | Customer cooking instructions |

---

### 1.8 `public.payouts`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Payout ID |
| `restaurant_id` | `UUID` | `NOT NULL REFERENCES public.restaurants(id)` | Restaurant foreign key |
| `settlement_reference` | `TEXT` | `UNIQUE NOT NULL` | Unique reference (e.g. `SET-2026-0923`) |
| `amount` | `NUMERIC(10,2)` | `NOT NULL` | Gross order earnings |
| `commission` | `NUMERIC(10,2)` | `NOT NULL` | 18% Platform commission |
| `tax` | `NUMERIC(10,2)` | `NOT NULL` | 18% GST on commission |
| `net_amount` | `NUMERIC(10,2)` | `NOT NULL` | Final transfer amount |
| `status` | `payout_status` | `DEFAULT 'PENDING'` | `PENDING`, `PROCESSING`, `COMPLETED` |
| `period_start` | `DATE` | `NOT NULL` | Settlement window start |
| `period_end` | `DATE` | `NOT NULL` | Settlement window end |
| `processed_at` | `TIMESTAMPTZ` | | Bank settlement timestamp |
| `utr_reference` | `TEXT` | | Bank transfer UTR number |

---

### 1.9 `public.audit_logs`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Log ID |
| `user_id` | `UUID` | `REFERENCES auth.users(id)` | User who triggered the action |
| `restaurant_id` | `UUID` | `REFERENCES public.restaurants(id)` | Restaurant context |
| `action` | `TEXT` | `NOT NULL` | Action code (e.g. `KYC_SUBMITTED`, `ORDER_STATUS_UPDATED`) |
| `resource_type` | `TEXT` | `NOT NULL` | Table/Entity name |
| `resource_id` | `TEXT` | | Target entity ID |
| `metadata` | `JSONB` | `DEFAULT '{}'::JSONB` | Contextual diff / payload metadata (sensitive data redacted) |
| `ip_address` | `TEXT` | | Client IP address |
| `user_agent` | `TEXT` | | Client User-Agent |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Immutable log timestamp |
