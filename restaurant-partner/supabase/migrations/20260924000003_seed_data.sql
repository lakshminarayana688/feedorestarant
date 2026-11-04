-- ============================================================================
-- FEEDO RESTAURANT PARTNER — SEED INITIAL DATA (03)
-- Seed data for testing and development
-- ============================================================================

-- 1. Insert Initial Restaurant
INSERT INTO public.restaurants (
    id,
    owner_id,
    name,
    legal_name,
    phone,
    email,
    restaurant_type,
    cuisines,
    address,
    city,
    state,
    pincode,
    latitude,
    longitude,
    status,
    verification_status,
    is_online,
    auto_accept_orders,
    new_order_sound,
    rating,
    total_reviews
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    'Lucky Family Restaurant',
    'Lucky Family Foods Pvt Ltd',
    '+91 98765 43210',
    'lucky.family.blr@feedopartner.com',
    'Restaurant',
    ARRAY['Biryani', 'South Indian', 'North Indian', 'Chinese'],
    'No. 42, 80 Feet Road, 4th Block, Koramangala',
    'Bengaluru',
    'Karnataka',
    '560034',
    12.9352,
    77.6245,
    'active',
    'approved',
    true,
    false,
    true,
    4.80,
    342
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    verification_status = EXCLUDED.verification_status;

-- 2. Insert KYC Record (with masked and encrypted demo placeholder)
INSERT INTO public.restaurant_kyc (
    id,
    restaurant_id,
    pan_number_encrypted,
    pan_last4,
    gst_number,
    fssai_number,
    verification_status,
    submitted_at,
    verified_at
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'ENC_PAN_HASH_AABCL9921D',
    '921D',
    '29AABCL9921D1Z8',
    '21223004000891',
    'approved',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '28 days'
) ON CONFLICT (restaurant_id) DO NOTHING;

-- 3. Insert Bank Account
INSERT INTO public.restaurant_bank_accounts (
    id,
    restaurant_id,
    account_holder_name,
    bank_name,
    account_number_encrypted,
    ifsc_code_encrypted,
    account_last4,
    verification_status,
    is_primary
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Lakshmi Narayana',
    'HDFC Bank - Koramangala Branch',
    'ENC_ACC_5010023489921',
    'ENC_IFSC_HDFC0000053',
    '9921',
    'approved',
    true
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert Menu Categories
INSERT INTO public.menu_categories (id, restaurant_id, name, description, sort_order, is_active)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Biryani & Rice', 'Authentic dum biryanis cooked with premium basmati', 1, true),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Starters & Appetizers', 'Crispy and spicy tandoori delicacies', 2, true),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Main Course', 'Rich gravies and curries', 3, true),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Breads', 'Freshly baked tandoori rotis and naans', 4, true),
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Beverages & Desserts', 'Refreshing drinks and sweet finishes', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Menu Items
INSERT INTO public.menu_items (
    id, restaurant_id, category_id, name, description, price, discount_price,
    image_url, is_available, is_veg, preparation_time, is_bestseller, rating
) VALUES
    (
        'e0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'Chicken Dum Biryani',
        'Traditional Hyderabadi spiced chicken dum biryani served with mirchi ka salan and creamy raita.',
        240.00,
        180.00,
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        true,
        false,
        18,
        true,
        4.9
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'Paneer Butter Masala Biryani',
        'Fragrant basmati rice layered with soft paneer cubes in buttery makhani gravy.',
        220.00,
        170.00,
        'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80',
        true,
        true,
        15,
        true,
        4.8
    ),
    (
        'e0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000002',
        'Crispy Chicken 65',
        'Deep fried spicy boneless chicken tossed with curry leaves, crushed pepper and green chillies.',
        190.00,
        150.00,
        'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
        true,
        false,
        12,
        true,
        4.7
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Sample Payouts
INSERT INTO public.payouts (
    id, restaurant_id, settlement_reference, amount, commission, tax, net_amount, status, period_start, period_end, processed_at, utr_reference
) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'SET-2026-0923', 18450.00, 3690.00, 553.00, 14207.00, 'COMPLETED', '2026-09-22', '2026-09-22', NOW() - INTERVAL '1 day', 'HDFCN2626678912'),
    ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SET-2026-0922', 22100.00, 4420.00, 663.00, 17017.00, 'COMPLETED', '2026-09-21', '2026-09-21', NOW() - INTERVAL '2 days', 'HDFCN2626554321')
ON CONFLICT (id) DO NOTHING;
