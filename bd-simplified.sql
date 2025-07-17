-- =====================================================
-- DOMIFY DATABASE SETUP - VERSIÓN SIMPLIFICADA
-- =====================================================
-- Solo lo esencial: tablas, enums, índices básicos y datos iniciales
-- Sin RLS complicado, sin triggers complejos, sin funciones innecesarias
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
-- NOTA: Esta migración debe ejecutarse después de crear el enum user_role
-- ALTER TABLE auth.users ADD COLUMN role user_role NOT NULL DEFAULT 'customer';

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
-- RELACIONES ADICIONALES PARA ADMIN PANEL
-- ===========================

-- Asegurar que las relaciones estén correctamente definidas para el panel de admin
-- (Estas relaciones ya están definidas en las tablas, pero las explicitamos aquí para claridad)

-- Relación customers -> auth.users (ya definida en la tabla customers)
-- CONSTRAINT fk_customers_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

-- Relación provider_profiles -> auth.users (ya definida en la tabla provider_profiles)  
-- CONSTRAINT fk_provider_profiles_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

-- Relación provider_applications -> auth.users (ya definida en la tabla provider_applications)
-- CONSTRAINT fk_provider_applications_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL

-- ===========================
-- RELACIÓN PROVEEDORES-CATEGORÍAS
-- ===========================

-- Relación proveedores-categorías
CREATE TABLE provider_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(provider_profile_id, category_id)
);

-- ===========================
-- SERVICIOS
-- ===========================

-- Servicios
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

-- Reservas
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

-- Pagos
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

-- Reseñas
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
    reviewer_user_id UUID NOT NULL REFERENCES auth.users(id),
    provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- APLICACIONES PARA SER PROVEEDOR
-- ===========================

-- Aplicaciones para ser proveedor
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

-- Categorías por aplicación
CREATE TABLE provider_application_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id INTEGER NOT NULL REFERENCES provider_applications(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(application_id, category_id)
);

-- ===========================
-- NOTIFICACIONES
-- ===========================

-- Notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- ÍNDICES BÁSICOS
-- ===========================

-- Índices más importantes para rendimiento
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX idx_provider_profiles_deleted_at ON provider_profiles(deleted_at);
CREATE INDEX idx_services_provider_id ON services(provider_profile_id);
CREATE INDEX idx_services_deleted_at ON services(deleted_at);
CREATE INDEX idx_bookings_client_id ON bookings(client_user_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_profile_id);
CREATE INDEX idx_bookings_deleted_at ON bookings(deleted_at);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_profile_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ===========================
-- FUNCIÓN SIMPLE PARA UPDATED_AT
-- ===========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers solo para las tablas que lo necesitan
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
-- RLS BÁSICO (OPCIONAL - PUEDES COMENTAR ESTA SECCIÓN)
-- ===========================

-- Solo habilitar RLS donde es absolutamente necesario
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas súper simples
-- CREATE POLICY "Users manage own data" ON customers FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Users manage own data" ON provider_profiles FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Users manage own data" ON bookings FOR ALL USING (auth.uid() = client_user_id OR auth.uid() IN (SELECT user_id FROM provider_profiles WHERE id = provider_profile_id));
-- CREATE POLICY "Users manage own data" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ===========================
-- DATOS INICIALES
-- ===========================

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
-- COMENTARIOS SOBRE LO QUE SE ELIMINÓ
-- ===========================

/*
ELIMINADO PARA SIMPLIFICAR:
- Extensiones pg_net y http (solo las usas si necesitas hacer requests HTTP desde la DB)
- Campos como deleted_at (soft deletes son complejos)
- Tablas complejas como conversations, messages, favorites, reports
- Funciones complejas de roles y verificaciones
- RLS complicado (lo dejé comentado para que decidas)
- Triggers complejos de rating automático
- Configuración de plataforma (puedes manejarlo desde tu app)
- Datos de prueba con UUIDs fake

MANTENIDO:
- Todas las tablas principales de tu negocio
- ENUMs necesarios
- Índices para rendimiento
- Función básica de updated_at
- Datos iniciales de categorías
- Estructura básica funcional
- Relaciones explícitas para el panel de admin

CAMBIO IMPORTANTE:
- Removida la columna 'role' de la tabla customers
- Los roles ahora se manejan desde auth.users (ver migración comentada arriba)
- Esto es mejor práctica ya que el rol es una propiedad del usuario, no del perfil
*/ 
