-- =====================================================
-- DOMIFY DATABASE SCHEMA - ESQUEMA COMPLETO ACTUALIZADO
-- =====================================================
-- Este archivo contiene el esquema completo de la base de datos
-- con todas las tablas, relaciones, enums, índices y datos iniciales
-- Última actualización: $(date)
-- =====================================================

-- ===========================
-- EXTENSIONES BÁSICAS
-- ===========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- ENUMS
-- ===========================
CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin');
CREATE TYPE booking_status AS ENUM ('pending_confirmation', 'confirmed', 'completed', 'payment_succeeded', 'cancelled_by_client', 'cancelled_by_provider');  
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cash');
CREATE TYPE application_status AS ENUM ('submitted', 'in_review', 'approved', 'rejected');
CREATE TYPE provider_type AS ENUM ('individual', 'company');

-- ===========================
-- MIGRACIÓN PARA AGREGAR ROLE A AUTH.USERS
-- ===========================
-- Esta migración debe ejecutarse después de crear el enum user_role
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'customer';
CREATE INDEX IF NOT EXISTS idx_auth_users_role ON auth.users(role);

-- ===========================
-- TABLAS PRINCIPALES
-- ===========================

-- Perfiles de clientes
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfiles de proveedores
CREATE TABLE provider_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE provider_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(provider_profile_id, category_id)
);

-- ===========================
-- SERVICIOS
-- ===========================

-- Servicios ofrecidos por los proveedores
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    deleted_at TIMESTAMPTZ
);

-- ===========================
-- PAGOS
-- ===========================

-- Información de pagos
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'NIO',
    status payment_status NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- RESEÑAS
-- ===========================

-- Reseñas de clientes a proveedores
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id),
    reviewer_user_id UUID NOT NULL REFERENCES auth.users(id),
    provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- APLICACIONES PARA SER PROVEEDOR
-- ===========================

-- Aplicaciones para convertirse en proveedor
CREATE TABLE provider_applications (
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
    CONSTRAINT check_user_or_email CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

-- ===========================
-- CATEGORÍAS POR APLICACIÓN
-- ===========================

-- Categorías seleccionadas en cada aplicación
CREATE TABLE provider_application_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id INTEGER NOT NULL REFERENCES provider_applications(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(application_id, category_id)
);

-- ===========================
-- NOTIFICACIONES
-- ===========================

-- Sistema de notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===========================

-- Índices principales para rendimiento
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX idx_provider_profiles_deleted_at ON provider_profiles(deleted_at);
CREATE INDEX idx_provider_profiles_is_active ON provider_profiles(is_active);
CREATE INDEX idx_provider_profiles_is_verified ON provider_profiles(is_verified);
CREATE INDEX idx_services_provider_id ON services(provider_profile_id);
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_services_deleted_at ON services(deleted_at);
CREATE INDEX idx_services_is_active ON services(is_active);
CREATE INDEX idx_bookings_client_id ON bookings(client_user_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_profile_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_deleted_at ON bookings(deleted_at);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_profile_id);
CREATE INDEX idx_reviews_reviewer_user_id ON reviews(reviewer_user_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_provider_applications_user_id ON provider_applications(user_id);
CREATE INDEX idx_provider_applications_status ON provider_applications(status);
CREATE INDEX idx_provider_applications_submitted_at ON provider_applications(submitted_at);
CREATE INDEX idx_provider_application_categories_application_id ON provider_application_categories(application_id);
CREATE INDEX idx_provider_application_categories_category_id ON provider_application_categories(category_id);
CREATE INDEX idx_provider_categories_provider_id ON provider_categories(provider_profile_id);
CREATE INDEX idx_provider_categories_category_id ON provider_categories(category_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ===========================
-- FUNCIÓN PARA UPDATED_AT
-- ===========================

-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar automáticamente updated_at
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_profiles_updated_at 
    BEFORE UPDATE ON provider_profiles FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================
-- FUNCIÓN PARA ACTUALIZAR RATING PROMEDIO
-- ===========================

-- Función para actualizar automáticamente el rating promedio del proveedor
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el rating promedio y total de reseñas
    UPDATE provider_profiles 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0.00)
            FROM reviews 
            WHERE provider_profile_id = NEW.provider_profile_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews 
            WHERE provider_profile_id = NEW.provider_profile_id
        )
    WHERE id = NEW.provider_profile_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar rating cuando se inserta/actualiza una reseña
CREATE TRIGGER update_provider_rating_trigger
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating();

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
CREATE POLICY "Users can view own customer profile" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own customer profile" ON customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customer profile" ON customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas de seguridad para provider_profiles
CREATE POLICY "Users can view all active provider profiles" ON provider_profiles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own provider profile" ON provider_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own provider profile" ON provider_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own provider profile" ON provider_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas de seguridad para services
CREATE POLICY "Users can view active services" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage own services" ON services
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_profile_id
        )
    );

-- Políticas de seguridad para bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (
        auth.uid() = client_user_id OR 
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_profile_id
        )
    );

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = client_user_id);

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (
        auth.uid() = client_user_id OR 
        auth.uid() IN (
            SELECT user_id FROM provider_profiles WHERE id = provider_profile_id
        )
    );

-- Políticas de seguridad para reviews
CREATE POLICY "Users can view all reviews" ON reviews
    FOR SELECT USING (true);

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
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de seguridad para provider_applications
CREATE POLICY "Users can view own applications" ON provider_applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" ON provider_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON provider_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

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
-- VISTAS ÚTILES
-- ===========================

-- Vista para obtener información completa de proveedores con sus categorías
CREATE OR REPLACE VIEW provider_details AS
SELECT 
    pp.*,
    u.email,
    u.role,
    array_agg(DISTINCT c.name) as category_names,
    array_agg(DISTINCT c.id) as category_ids,
    COUNT(DISTINCT s.id) as total_services,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT r.id) as total_reviews
FROM provider_profiles pp
LEFT JOIN auth.users u ON pp.user_id = u.id
LEFT JOIN provider_categories pc ON pp.id = pc.provider_profile_id
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN services s ON pp.id = s.provider_profile_id AND s.is_active = true
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

-- ===========================
-- FUNCIONES ÚTILES
-- ===========================

-- Función para obtener proveedores por categoría
CREATE OR REPLACE FUNCTION get_providers_by_category(category_slug TEXT)
RETURNS TABLE (
    provider_id UUID,
    business_name VARCHAR(255),
    headline VARCHAR(255),
    hourly_rate NUMERIC(10,2),
    average_rating NUMERIC(3,2),
    total_reviews INTEGER,
    location TEXT,
    is_verified BOOLEAN
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
        pp.is_verified
    FROM provider_profiles pp
    JOIN provider_categories pc ON pp.id = pc.provider_profile_id
    JOIN categories c ON pc.category_id = c.id
    WHERE c.slug = category_slug
    AND pp.is_active = true
    AND pp.deleted_at IS NULL
    ORDER BY pp.average_rating DESC, pp.total_reviews DESC;
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
    active_services INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT b.id)::INTEGER as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END)::INTEGER as completed_bookings,
        COALESCE(SUM(b.total_price), 0) as total_revenue,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id)::INTEGER as total_reviews,
        COUNT(DISTINCT CASE WHEN s.is_active THEN s.id END)::INTEGER as active_services
    FROM provider_profiles pp
    LEFT JOIN bookings b ON pp.id = b.provider_profile_id
    LEFT JOIN reviews r ON pp.id = r.provider_profile_id
    LEFT JOIN services s ON pp.id = s.provider_profile_id
    WHERE pp.id = provider_uuid
    AND pp.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ===========================
-- VERIFICACIÓN FINAL
-- ===========================

-- Verificar que todas las tablas fueron creadas correctamente
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'customers', 'categories', 'provider_profiles', 'provider_categories',
        'services', 'bookings', 'payments', 'reviews', 'provider_applications',
        'provider_application_categories', 'notifications'
    );
    
    IF table_count = 11 THEN
        RAISE NOTICE '✅ Todas las tablas fueron creadas exitosamente';
    ELSE
        RAISE NOTICE '⚠️  Solo % de 11 tablas fueron creadas', table_count;
    END IF;
END $$;

-- Mostrar resumen final
SELECT 
    'DOMIFY DATABASE SCHEMA COMPLETED' as status,
    NOW() as created_at,
    'All tables, relationships, indexes, and initial data have been created successfully' as message; 