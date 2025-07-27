-- =====================================================
-- DOMIFY DATABASE SCHEMA - POSTGRESQL OPTIMIZED
-- =====================================================
-- Esquema completo optimizado para PostgreSQL
-- Compatible con PostgreSQL 12+ y Supabase
-- Última actualización: $(date)
-- =====================================================

-- ===========================
-- EXTENSIONES POSTGRESQL
-- ===========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsquedas de texto
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Para índices GIN

-- ===========================
-- ENUMS
-- ===========================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending_confirmation', 'confirmed', 'completed', 'payment_succeeded', 'cancelled_by_client', 'cancelled_by_provider');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cash');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('submitted', 'in_review', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE provider_type AS ENUM ('individual', 'company');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================
-- MIGRACIÓN PARA AGREGAR ROLE A AUTH.USERS
-- ===========================
DO $$ 
BEGIN
    -- Verificar si la columna role ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE auth.users ADD COLUMN role user_role NOT NULL DEFAULT 'customer';
    END IF;
END $$;

-- Crear índice si no existe
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auth_users_role ON auth.users(role);

-- ===========================
-- TABLAS PRINCIPALES
-- ===========================

-- Perfiles de clientes
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50),
    address TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Categorías de servicios
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfiles de proveedores
CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_type provider_type NOT NULL DEFAULT 'individual',
    business_name VARCHAR(255) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    bio TEXT,
    hourly_rate NUMERIC(10,2) CHECK (hourly_rate >= 0),
    phone VARCHAR(50),
    location TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ===========================
-- RELACIÓN PROVEEDORES-CATEGORÍAS
-- ===========================

-- Relación muchos a muchos entre proveedores y categorías
CREATE TABLE IF NOT EXISTS provider_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider_profile_id, category_id)
);

-- ===========================
-- SERVICIOS
-- ===========================

-- Servicios ofrecidos por los proveedores
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ===========================
-- RESERVAS
-- ===========================

-- Reservas de servicios
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_user_id UUID NOT NULL REFERENCES auth.users(id),
    provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
    service_id UUID REFERENCES services(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending_confirmation',
    total_price NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_booking_time CHECK (end_time > start_time)
);

-- ===========================
-- PAGOS
-- ===========================

-- Información de pagos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'NIO',
    status payment_status NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- RESEÑAS
-- ===========================

-- Reseñas de clientes a proveedores
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id),
    reviewer_user_id UUID NOT NULL REFERENCES auth.users(id),
    provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- APLICACIONES PARA SER PROVEEDOR
-- ===========================

-- Aplicaciones para convertirse en proveedor
CREATE TABLE IF NOT EXISTS provider_applications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    email TEXT,
    headline VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    hourly_rate NUMERIC(10,2) NOT NULL CHECK (hourly_rate >= 0),
    location TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    status application_status NOT NULL DEFAULT 'submitted',
    application_data JSONB,
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by_admin_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_user_or_email CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

-- ===========================
-- CATEGORÍAS POR APLICACIÓN
-- ===========================

-- Categorías seleccionadas en cada aplicación
CREATE TABLE IF NOT EXISTS provider_application_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id INTEGER NOT NULL REFERENCES provider_applications(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(application_id, category_id)
);

-- ===========================
-- NOTIFICACIONES
-- ===========================

-- Sistema de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- ÍNDICES POSTGRESQL OPTIMIZADOS
-- ===========================

-- Índices B-tree para consultas exactas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_profiles_deleted_at ON provider_profiles(deleted_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_profiles_is_active ON provider_profiles(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_profiles_is_verified ON provider_profiles(is_verified);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_provider_id ON services(provider_profile_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_deleted_at ON services(deleted_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_client_id ON bookings(client_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_profile_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_deleted_at ON bookings(deleted_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_date_range ON bookings(start_time, end_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_profile_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_reviewer_user_id ON reviews(reviewer_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_applications_user_id ON provider_applications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_applications_status ON provider_applications(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_applications_submitted_at ON provider_applications(submitted_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_application_categories_application_id ON provider_application_categories(application_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_application_categories_category_id ON provider_application_categories(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_categories_provider_id ON provider_categories(provider_profile_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_categories_category_id ON provider_categories(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Índices GIN para búsquedas de texto completo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_profiles_business_name_gin ON provider_profiles USING gin(business_name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_profiles_headline_gin ON provider_profiles USING gin(headline gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_title_gin ON services USING gin(title gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_description_gin ON services USING gin(description gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_name_gin ON categories USING gin(name gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_description_gin ON categories USING gin(description gin_trgm_ops);

-- Índices parciales para optimizar consultas comunes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_provider_profiles ON provider_profiles(id) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_services ON services(id) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pending_bookings ON bookings(id) WHERE status = 'pending_confirmation' AND deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_unread_notifications ON notifications(id) WHERE is_read = false;

-- ===========================
-- FUNCIONES POSTGRESQL
-- ===========================

-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar automáticamente el rating promedio del proveedor
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el rating promedio y total de reseñas
    UPDATE provider_profiles 
    SET 
        average_rating = (
            SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0.00)
            FROM reviews 
            WHERE provider_profile_id = NEW.provider_profile_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews 
            WHERE provider_profile_id = NEW.provider_profile_id
        ),
        updated_at = NOW()
    WHERE id = NEW.provider_profile_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para validar que un usuario no tenga múltiples perfiles
CREATE OR REPLACE FUNCTION validate_single_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar que el usuario no tenga ya un perfil de proveedor
    IF EXISTS (
        SELECT 1 FROM provider_profiles 
        WHERE user_id = NEW.user_id AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        RAISE EXCEPTION 'User already has a provider profile';
    END IF;
    
    -- Verificar que el usuario no tenga ya un perfil de cliente
    IF EXISTS (
        SELECT 1 FROM customers 
        WHERE user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'User already has a customer profile';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- TRIGGERS
-- ===========================

-- Triggers para actualizar automáticamente updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_provider_profiles_updated_at ON provider_profiles;
CREATE TRIGGER update_provider_profiles_updated_at 
    BEFORE UPDATE ON provider_profiles FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_provider_applications_updated_at ON provider_applications;
CREATE TRIGGER update_provider_applications_updated_at 
    BEFORE UPDATE ON provider_applications FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar rating cuando se inserta/actualiza una reseña
DROP TRIGGER IF EXISTS update_provider_rating_trigger ON reviews;
CREATE TRIGGER update_provider_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating();

-- Trigger para validar perfiles únicos
DROP TRIGGER IF EXISTS validate_provider_profile ON provider_profiles;
CREATE TRIGGER validate_provider_profile
    BEFORE INSERT OR UPDATE ON provider_profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_single_profile();

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================

-- Habilitar RLS en las tablas principales
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_applications ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para customers
DROP POLICY IF EXISTS "Users can view own customer profile" ON customers;
CREATE POLICY "Users can view own customer profile" ON customers
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own customer profile" ON customers;
CREATE POLICY "Users can update own customer profile" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own customer profile" ON customers;
CREATE POLICY "Users can insert own customer profile" ON customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas de seguridad para provider_profiles
DROP POLICY IF EXISTS "Users can view all active provider profiles" ON provider_profiles;
CREATE POLICY "Users can view all active provider profiles" ON provider_profiles
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can view own provider profile" ON provider_profiles;
CREATE POLICY "Users can view own provider profile" ON provider_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own provider profile" ON provider_profiles;
CREATE POLICY "Users can update own provider profile" ON provider_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own provider profile" ON provider_profiles;
CREATE POLICY "Users can insert own provider profile" ON provider_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas de seguridad para services
DROP POLICY IF EXISTS "Users can view active services" ON services;
CREATE POLICY "Users can view active services" ON services
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Providers can manage own services" ON services;
CREATE POLICY "Providers can manage own services" ON services
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_profile_id
        )
    );

-- Políticas de seguridad para bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (
        auth.uid() = client_user_id OR 
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_profile_id
        )
    );

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = client_user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (
        auth.uid() = client_user_id OR 
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_profile_id
        )
    );

-- Políticas de seguridad para reviews
DROP POLICY IF EXISTS "Users can view all reviews" ON reviews;
CREATE POLICY "Users can view all reviews" ON reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews for completed bookings" ON reviews;
CREATE POLICY "Users can create reviews for completed bookings" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_user_id AND
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_id 
            AND client_user_id = auth.uid()
            AND status = 'completed'
        )
    );

-- Políticas de seguridad para notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de seguridad para provider_applications
DROP POLICY IF EXISTS "Users can view own applications" ON provider_applications;
CREATE POLICY "Users can view own applications" ON provider_applications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create applications" ON provider_applications;
CREATE POLICY "Users can create applications" ON provider_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all applications" ON provider_applications;
CREATE POLICY "Admins can view all applications" ON provider_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update applications" ON provider_applications;
CREATE POLICY "Admins can update applications" ON provider_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ===========================
-- DATOS INICIALES
-- ===========================

-- Insertar categorías de servicios
INSERT INTO categories (name, slug, description, icon) VALUES
    ('Electricistas', 'electricistas', 'Instalaciones y reparaciones eléctricas residenciales y comerciales', '💡'),
    ('Fontaneros / Plomeros', 'fontaneros', 'Reparación e instalación de sistemas de fontanería y tuberías', '🚰'),
    ('Mantenimiento de aires acondicionados', 'aires-acondicionados', 'Limpieza, recarga e instalación de equipos de aire acondicionado', '❄️'),
    ('Refrigeración', 'refrigeracion', 'Reparación de freezers, refrigeradoras y cuartos fríos', '🧊'),
    ('Albañilería / Construcción / Remodelación', 'albanileria', 'Obras de construcción, remodelación y acabados en general', '🏗️'),
    ('Soldadura y Herrería', 'soldadura-herreria', 'Trabajos de soldadura, fabricación y reparación de estructuras metálicas', '⚒️'),
    ('Jardinería y poda de árboles', 'jardineria', 'Diseño, mantenimiento de jardines y poda de árboles', '🌳'),
    ('Limpieza de terrenos y lotificación', 'limpieza-terrenos', 'Desbroce y limpieza de terrenos para construcción o cultivo', '🧹'),
    ('Instalación de cercas', 'instalacion-cercas', 'Colocación de malla ciclón, cercas eléctricas y otros cercados', '🚧'),
    ('Limpieza general y profunda de casas', 'limpieza-casas', 'Limpieza residencial estándar y detallada', '🏠'),
    ('Limpieza de muebles, alfombras y colchones', 'limpieza-muebles', 'Lavado y desinfección de tapicería y alfombras', '🛋️'),
    ('Fumigación y control de plagas', 'fumigacion', 'Eliminación y prevención de plagas en interiores y exteriores', '🐜'),
    ('Pintura residencial y comercial', 'pintura', 'Aplicación de pintura, acabados y recubrimientos', '🖌️'),
    ('Carpintería y reparación de muebles', 'carpinteria', 'Fabricación y reparación de muebles de madera', '🪚'),
    ('Reparación de computadoras y laptops', 'reparacion-computadoras', 'Mantenimiento y reparación de equipos de cómputo', '💻'),
    ('Redes e instalación de cámaras de seguridad', 'redes-camaras', 'Configuración de redes y sistemas de videovigilancia', '📷'),
    ('Diseño gráfico y marketing digital', 'diseno-grafico', 'Servicios de branding, diseño y promoción digital', '🎨'),
    ('Mecánica automotriz', 'mecanica-automotriz', 'Mantenimiento preventivo y correctivo de vehículos', '🚗'),
    ('Lavado y detallado de autos', 'lavado-autos', 'Limpieza exterior e interior, pulido y encerado de vehículos', '🚙'),
    ('Hojalatería y pintura de autos', 'hojalateria-pintura-autos', 'Reparación de carrocería y pintura automotriz', '🚘'),
    ('Instalación de polarizado y accesorios', 'polarizado-accesorios', 'Colocación de polarizado, audio y accesorios automotrices', '🪟'),
    ('Cerrajería', 'cerrajeria', 'Apertura, cambio y reparación de cerraduras', '🔑'),
    ('Instalación de gypsum y cielo raso', 'gypsum-cielo-raso', 'Construcción y acabados en paneles de yeso', '🏚️'),
    ('Vidriería y aluminio', 'vidrieria-aluminio', 'Fabricación e instalación de ventanas y puertas de vidrio y aluminio', '🔲'),
    ('Montaje y Ensamblaje', 'montaje', 'Montaje de muebles, TV, estanterías y ensamblaje de equipos en general', '🔧'),
    ('Instalación de electrodomésticos', 'instalacion-electrodomesticos', 'Instalación y configuración de electrodomésticos y equipos del hogar', '🏠')
ON CONFLICT (slug) DO NOTHING;

-- ===========================
-- VISTAS POSTGRESQL OPTIMIZADAS
-- ===========================

-- Vista para obtener información completa de proveedores con sus categorías
CREATE OR REPLACE VIEW provider_details AS
SELECT 
    pp.*,
    u.email,
    u.role,
    array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as category_names,
    array_agg(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL) as category_ids,
    COUNT(DISTINCT s.id) FILTER (WHERE s.is_active = true) as total_services,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT r.id) as total_reviews
FROM provider_profiles pp
LEFT JOIN auth.users u ON pp.user_id = u.id
LEFT JOIN provider_categories pc ON pp.id = pc.provider_profile_id
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN services s ON pp.id = s.provider_profile_id
LEFT JOIN bookings b ON pp.id = b.provider_profile_id
LEFT JOIN reviews r ON pp.id = r.provider_profile_id
WHERE pp.deleted_at IS NULL
GROUP BY pp.id, u.email, u.role;

-- Vista para obtener estadísticas de reservas
CREATE OR REPLACE VIEW booking_stats AS
SELECT 
    status,
    COUNT(*) as total_bookings,
    SUM(total_price) as total_revenue,
    AVG(total_price) as average_price,
    MIN(created_at) as first_booking,
    MAX(created_at) as last_booking
FROM bookings
WHERE deleted_at IS NULL
GROUP BY status;

-- Vista para obtener reseñas con información del cliente
CREATE OR REPLACE VIEW review_details AS
SELECT 
    r.*,
    c.first_name as reviewer_first_name,
    c.last_name as reviewer_last_name,
    pp.business_name as provider_business_name,
    b.start_time as booking_start_time,
    b.end_time as booking_end_time
FROM reviews r
LEFT JOIN customers c ON r.reviewer_user_id = c.user_id
LEFT JOIN provider_profiles pp ON r.provider_profile_id = pp.id
LEFT JOIN bookings b ON r.booking_id = b.id;

-- Vista para búsqueda de servicios
CREATE OR REPLACE VIEW service_search AS
SELECT 
    s.*,
    pp.business_name,
    pp.headline,
    pp.average_rating,
    pp.total_reviews,
    pp.is_verified,
    c.name as category_name,
    c.slug as category_slug
FROM services s
JOIN provider_profiles pp ON s.provider_profile_id = pp.id
JOIN categories c ON s.category_id = c.id
WHERE s.is_active = true 
AND s.deleted_at IS NULL 
AND pp.is_active = true 
AND pp.deleted_at IS NULL;

-- ===========================
-- FUNCIONES POSTGRESQL AVANZADAS
-- ===========================

-- Función para obtener proveedores por categoría con paginación
CREATE OR REPLACE FUNCTION get_providers_by_category(
    category_slug TEXT,
    page_size INTEGER DEFAULT 10,
    page_number INTEGER DEFAULT 1
)
RETURNS TABLE (
    provider_id UUID,
    business_name VARCHAR(255),
    headline VARCHAR(255),
    hourly_rate NUMERIC(10,2),
    average_rating NUMERIC(3,2),
    total_reviews INTEGER,
    location TEXT,
    is_verified BOOLEAN,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH provider_data AS (
        SELECT 
            pp.id,
            pp.business_name,
            pp.headline,
            pp.hourly_rate,
            pp.average_rating,
            pp.total_reviews,
            pp.location,
            pp.is_verified,
            COUNT(*) OVER() as total_count
        FROM provider_profiles pp
        JOIN provider_categories pc ON pp.id = pc.provider_profile_id
        JOIN categories c ON pc.category_id = c.id
        WHERE c.slug = category_slug
        AND pp.is_active = true
        AND pp.deleted_at IS NULL
        ORDER BY pp.average_rating DESC, pp.total_reviews DESC
        LIMIT page_size
        OFFSET (page_number - 1) * page_size
    )
    SELECT * FROM provider_data;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular estadísticas de un proveedor
CREATE OR REPLACE FUNCTION get_provider_stats(provider_uuid UUID)
RETURNS TABLE (
    total_bookings INTEGER,
    completed_bookings INTEGER,
    total_revenue NUMERIC(10,2),
    average_rating NUMERIC(3,2),
    total_reviews INTEGER,
    active_services INTEGER,
    monthly_revenue NUMERIC(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT b.id)::INTEGER as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END)::INTEGER as completed_bookings,
        COALESCE(SUM(b.total_price), 0) as total_revenue,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id)::INTEGER as total_reviews,
        COUNT(DISTINCT CASE WHEN s.is_active THEN s.id END)::INTEGER as active_services,
        COALESCE(SUM(CASE WHEN b.created_at >= NOW() - INTERVAL '1 month' THEN b.total_price ELSE 0 END), 0) as monthly_revenue
    FROM provider_profiles pp
    LEFT JOIN bookings b ON pp.id = b.provider_profile_id
    LEFT JOIN reviews r ON pp.id = r.provider_profile_id
    LEFT JOIN services s ON pp.id = s.provider_profile_id
    WHERE pp.id = provider_uuid
    AND pp.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Función para búsqueda de texto completo
CREATE OR REPLACE FUNCTION search_providers(search_term TEXT)
RETURNS TABLE (
    provider_id UUID,
    business_name VARCHAR(255),
    headline VARCHAR(255),
    hourly_rate NUMERIC(10,2),
    average_rating NUMERIC(3,2),
    total_reviews INTEGER,
    location TEXT,
    is_verified BOOLEAN,
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.id,
        pp.business_name,
        pp.headline,
        pp.hourly_rate,
        pp.average_rating,
        pp.total_reviews,
        pp.location,
        pp.is_verified,
        GREATEST(
            similarity(pp.business_name, search_term),
            similarity(pp.headline, search_term),
            similarity(pp.location, search_term)
        ) as similarity_score
    FROM provider_profiles pp
    WHERE pp.is_active = true
    AND pp.deleted_at IS NULL
    AND (
        pp.business_name ILIKE '%' || search_term || '%'
        OR pp.headline ILIKE '%' || search_term || '%'
        OR pp.location ILIKE '%' || search_term || '%'
    )
    ORDER BY similarity_score DESC, pp.average_rating DESC;
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- CONFIGURACIÓN POSTGRESQL
-- ===========================

-- Configurar parámetros de rendimiento para PostgreSQL
-- (Estos se pueden ajustar según el tamaño de la base de datos)

-- Optimizar para consultas de texto
SET default_text_search_config = 'pg_catalog.spanish';

-- Configurar estadísticas de columnas para optimizador
ANALYZE customers;
ANALYZE provider_profiles;
ANALYZE services;
ANALYZE bookings;
ANALYZE reviews;
ANALYZE categories;

-- ===========================
-- VERIFICACIÓN FINAL
-- ===========================

-- Verificar que todas las tablas fueron creadas correctamente
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Contar tablas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'customers', 'categories', 'provider_profiles', 'provider_categories',
        'services', 'bookings', 'payments', 'reviews', 'provider_applications',
        'provider_application_categories', 'notifications'
    );
    
    -- Contar índices
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    -- Contar funciones
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';
    
    RAISE NOTICE '✅ Verificación completada:';
    RAISE NOTICE '   - Tablas creadas: % de 11', table_count;
    RAISE NOTICE '   - Índices creados: %', index_count;
    RAISE NOTICE '   - Funciones creadas: %', function_count;
    
    IF table_count = 11 THEN
        RAISE NOTICE '🎉 Base de datos PostgreSQL configurada exitosamente!';
    ELSE
        RAISE NOTICE '⚠️  Algunas tablas no se crearon correctamente';
    END IF;
END $$;

-- Mostrar resumen final
SELECT 
    'DOMIFY POSTGRESQL DATABASE SCHEMA COMPLETED' as status,
    NOW() as created_at,
    'PostgreSQL-optimized database with all tables, relationships, indexes, and functions created successfully' as message,
    version() as postgresql_version; 