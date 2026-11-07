-- supabase/migrations/20261108000001_service_availability_20km.sql
-- FEEDO Exact 20 KM Location-Based Service Availability & Haversine Distance Engine

-- 1. Exact Haversine Distance Calculation Function (in Kilometers)
CREATE OR REPLACE FUNCTION public.calculate_haversine_distance_km(
    lat1 NUMERIC,
    lon1 NUMERIC,
    lat2 NUMERIC,
    lon2 NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    r CONSTANT NUMERIC := 6371.0; -- Earth mean radius in km
    dlat NUMERIC;
    dlon NUMERIC;
    a NUMERIC;
    c NUMERIC;
    lat1_rad NUMERIC;
    lat2_rad NUMERIC;
BEGIN
    -- Validate input coordinates
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;

    IF lat1 < -90 OR lat1 > 90 OR lat2 < -90 OR lat2 > 90 OR
       lon1 < -180 OR lon1 > 180 OR lon2 < -180 OR lon2 > 180 THEN
        RETURN NULL;
    END IF;

    -- Convert degrees to radians
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    lat1_rad := radians(lat1);
    lat2_rad := radians(lat2);

    -- Haversine formula
    a := sin(dlat / 2.0)^2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2.0)^2;
    c := 2.0 * atan2(sqrt(a), sqrt(1.0 - a));

    RETURN ROUND(r * c, 3);
END;
$$;

-- 2. Query Eligible Nearby Restaurants strictly within 20 KM
CREATE OR REPLACE FUNCTION public.get_eligible_restaurants_20km(
    customer_lat NUMERIC,
    customer_lng NUMERIC,
    max_radius_km NUMERIC DEFAULT 20.0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    city TEXT,
    pincode TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    status public.restaurant_status,
    verification_status public.verification_status,
    is_online BOOLEAN,
    auto_accept_orders BOOLEAN,
    distance_km NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Validate customer coordinates
    IF customer_lat IS NULL OR customer_lng IS NULL OR
       customer_lat < -90 OR customer_lat > 90 OR
       customer_lng < -180 OR customer_lng > 180 THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        r.id,
        r.name,
        r.address,
        r.city,
        r.pincode,
        r.latitude,
        r.longitude,
        r.status,
        r.verification_status,
        r.is_online,
        r.auto_accept_orders,
        public.calculate_haversine_distance_km(customer_lat, customer_lng, r.latitude, r.longitude) AS distance_km
    FROM public.restaurants r
    WHERE
        r.status = 'active'
        AND r.verification_status = 'approved'
        AND r.is_online = true
        AND r.latitude IS NOT NULL
        AND r.longitude IS NOT NULL
        AND public.calculate_haversine_distance_km(customer_lat, customer_lng, r.latitude, r.longitude) <= max_radius_km
    ORDER BY distance_km ASC;
END;
$$;

-- 3. Check Overall Service Availability Summary for a Customer GPS Coordinate
CREATE OR REPLACE FUNCTION public.check_service_availability_20km(
    customer_lat NUMERIC,
    customer_lng NUMERIC,
    max_radius_km NUMERIC DEFAULT 20.0
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    eligible_count INT;
    min_dist NUMERIC;
BEGIN
    -- Default response when invalid coordinates supplied
    IF customer_lat IS NULL OR customer_lng IS NULL OR
       customer_lat < -90 OR customer_lat > 90 OR
       customer_lng < -180 OR customer_lng > 180 THEN
        RETURN jsonb_build_object(
            'is_available', false,
            'eligible_count', 0,
            'max_radius_km', max_radius_km,
            'error', 'Invalid customer geographical coordinates'
        );
    END IF;

    SELECT
        COUNT(*),
        MIN(public.calculate_haversine_distance_km(customer_lat, customer_lng, r.latitude, r.longitude))
    INTO eligible_count, min_dist
    FROM public.restaurants r
    WHERE
        r.status = 'active'
        AND r.verification_status = 'approved'
        AND r.is_online = true
        AND r.latitude IS NOT NULL
        AND r.longitude IS NOT NULL
        AND public.calculate_haversine_distance_km(customer_lat, customer_lng, r.latitude, r.longitude) <= max_radius_km;

    RETURN jsonb_build_object(
        'is_available', (eligible_count > 0),
        'eligible_count', eligible_count,
        'min_distance_km', min_dist,
        'max_radius_km', max_radius_km,
        'customer_coordinates', jsonb_build_object('latitude', customer_lat, 'longitude', customer_lng)
    );
END;
$$;

