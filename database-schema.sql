-- ==============================================
-- DOMIFY DATABASE SCHEMA
-- Complete database setup for the Domify marketplace
-- ==============================================

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ==============================================
-- EXTENSIONS
-- ==============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- ENUMS
-- ==============================================

-- User roles
CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin');

-- Booking status
CREATE TYPE booking_status AS ENUM (
    'pending_confirmation',
    'confirmed', 
    'in_progress',
    'completed',
    'cancelled_by_client',
    'cancelled_by_provider'
);

-- Application status
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- ==============================================
-- MAIN TABLES
-- ==============================================

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer profiles (extends auth.users)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nicaragua',
    date_of_birth DATE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Provider profiles (extends auth.users)
CREATE TABLE provider_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    description TEXT,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nicaragua',
    website VARCHAR(200),
    logo_url TEXT,
    cover_image_url TEXT,
    years_experience INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id),
    CONSTRAINT rating_range CHECK (average_rating >= 0 AND average_rating <= 5)
);

-- Provider categories (many-to-many relationship)
CREATE TABLE provider_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider_id, category_id)
);

-- Provider services
CREATE TABLE provider_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    duration_hours DECIMAL(4,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_price CHECK (base_price > 0)
);

-- Provider working hours
CREATE TABLE provider_working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider_id, day_of_week)
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_user_id UUID NOT NULL REFERENCES auth.users(id),
    provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
    service_id UUID REFERENCES provider_services(id),
    service_name VARCHAR(200) NOT NULL, -- Snapshot of service name
    service_description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_hours DECIMAL(4,2) DEFAULT 1.0,
    base_price DECIMAL(10,2) NOT NULL,
    additional_fees DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending_confirmation',
    client_notes TEXT,
    provider_notes TEXT,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    CONSTRAINT positive_prices CHECK (base_price > 0 AND total_price > 0),
    CONSTRAINT future_booking CHECK (scheduled_date >= CURRENT_DATE)
);

-- Reviews and ratings
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    client_user_id UUID NOT NULL REFERENCES auth.users(id),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(booking_id) -- One review per booking
);

-- Provider applications (for becoming a provider)
CREATE TABLE provider_applications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    years_experience INTEGER DEFAULT 0,
    categories INTEGER[] NOT NULL, -- Array of category IDs
    portfolio_images TEXT[], -- Array of image URLs
    documents TEXT[], -- Array of document URLs (certificates, licenses, etc.)
    status application_status DEFAULT 'pending',
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    
    UNIQUE(user_id) -- One application per user
);

-- Messages/Chat system
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    client_user_id UUID NOT NULL REFERENCES auth.users(id),
    provider_user_id UUID NOT NULL REFERENCES auth.users(id),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(booking_id),
    UNIQUE(client_user_id, provider_user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'booking', 'message', 'review', 'system'
    related_id UUID, -- booking_id, message_id, etc.
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider portfolio/gallery
CREATE TABLE provider_portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title VARCHAR(200),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Categories
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- Provider profiles
CREATE INDEX idx_provider_profiles_is_active ON provider_profiles(is_active);
CREATE INDEX idx_provider_profiles_city ON provider_profiles(city);
CREATE INDEX idx_provider_profiles_rating ON provider_profiles(average_rating DESC);

-- Provider services
CREATE INDEX idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX idx_provider_services_category_id ON provider_services(category_id);
CREATE INDEX idx_provider_services_is_active ON provider_services(is_active);

-- Bookings
CREATE INDEX idx_bookings_client_user_id ON bookings(client_user_id);
CREATE INDEX idx_bookings_provider_profile_id ON bookings(provider_profile_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Reviews
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_provider_profiles_updated_at BEFORE UPDATE ON provider_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_provider_services_updated_at BEFORE UPDATE ON provider_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update provider stats when reviews change
CREATE OR REPLACE FUNCTION update_provider_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update provider's average rating and total reviews
    UPDATE provider_profiles 
    SET 
        average_rating = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM reviews 
            WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
            AND is_public = true
        ), 0),
        total_reviews = COALESCE((
            SELECT COUNT(*)
            FROM reviews 
            WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
            AND is_public = true
        ), 0)
    WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update provider stats
CREATE TRIGGER update_provider_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_provider_stats();

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for conversation updates
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_portfolio ENABLE ROW LEVEL SECURITY;

-- Categories (public read, admin write)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify categories" ON categories FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Customers (users can only see/edit their own data)
CREATE POLICY "Users can view own customer profile" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own customer profile" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customer profile" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Provider profiles (providers can edit own, everyone can view active)
CREATE POLICY "Active provider profiles are viewable by everyone" ON provider_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Providers can update own profile" ON provider_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Providers can insert own profile" ON provider_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all provider profiles" ON provider_profiles FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Provider services (providers can manage own, everyone can view active)
CREATE POLICY "Active provider services are viewable by everyone" ON provider_services 
    FOR SELECT USING (is_active = true AND EXISTS (
        SELECT 1 FROM provider_profiles 
        WHERE id = provider_id AND is_active = true
    ));
CREATE POLICY "Providers can manage own services" ON provider_services 
    FOR ALL USING (EXISTS (
        SELECT 1 FROM provider_profiles 
        WHERE id = provider_id AND user_id = auth.uid()
    ));

-- Bookings (clients and providers can see their own bookings)
CREATE POLICY "Users can view own bookings as client" ON bookings FOR SELECT USING (auth.uid() = client_user_id);
CREATE POLICY "Providers can view own bookings" ON bookings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM provider_profiles 
        WHERE id = provider_profile_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Clients can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = client_user_id);
CREATE POLICY "Clients can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = client_user_id);
CREATE POLICY "Providers can update bookings for their services" ON bookings FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM provider_profiles 
        WHERE id = provider_profile_id AND user_id = auth.uid()
    )
);

-- Reviews (everyone can read public reviews, only clients can write)
CREATE POLICY "Public reviews are viewable by everyone" ON reviews FOR SELECT USING (is_public = true);
CREATE POLICY "Clients can create reviews for their bookings" ON reviews FOR INSERT WITH CHECK (
    auth.uid() = client_user_id AND 
    EXISTS (
        SELECT 1 FROM bookings 
        WHERE id = booking_id AND client_user_id = auth.uid() AND status = 'completed'
    )
);
CREATE POLICY "Clients can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = client_user_id);

-- ==============================================
-- SAMPLE DATA
-- ==============================================

-- Insert categories
INSERT INTO categories (name, description, icon, sort_order) VALUES
('Limpieza', 'Servicios de limpieza doméstica y comercial', '🧽', 1),
('Jardinería', 'Mantenimiento de jardines y paisajismo', '🌱', 2),
('Plomería', 'Reparaciones e instalaciones de plomería', '🔧', 3),
('Electricidad', 'Instalaciones y reparaciones eléctricas', '⚡', 4),
('Carpintería', 'Trabajos en madera y muebles', '🪚', 5),
('Pintura', 'Pintura de interiores y exteriores', '🎨', 6),
('Cocina', 'Servicios de catering y chef privado', '👨‍🍳', 7),
('Tecnología', 'Soporte técnico y reparación de dispositivos', '💻', 8),
('Transporte', 'Servicios de mudanza y delivery', '🚚', 9),
('Belleza', 'Servicios de peluquería y estética', '💄', 10);

-- Note: Users need to be created through Supabase Auth, then you can add provider profiles
-- Sample provider profiles would be added after user creation:

/*
-- Example provider profile (replace UUIDs with real ones from auth.users)
INSERT INTO provider_profiles (user_id, business_name, description, phone, city, years_experience) VALUES
('USER_UUID_HERE', 'Limpieza Profesional Nicaragua', 'Servicios de limpieza de alta calidad para hogares y oficinas', '+505 8888-9999', 'Managua', 5);

-- Example provider categories
INSERT INTO provider_categories (provider_id, category_id) VALUES
('PROVIDER_UUID_HERE', 1); -- Limpieza

-- Example services
INSERT INTO provider_services (provider_id, category_id, name, description, base_price, duration_hours) VALUES
('PROVIDER_UUID_HERE', 1, 'Limpieza General de Casa', 'Limpieza completa de todas las habitaciones', 250.00, 3.0),
('PROVIDER_UUID_HERE', 1, 'Limpieza Profunda', 'Limpieza detallada incluyendo ventanas y electrodomésticos', 400.00, 5.0);
*/

-- ==============================================
-- VIEWS FOR EASY QUERYING
-- ==============================================

-- Provider overview with ratings and categories
CREATE VIEW provider_overview AS
SELECT 
    pp.id,
    pp.user_id,
    pp.business_name,
    pp.description,
    pp.phone,
    pp.city,
    pp.average_rating,
    pp.total_reviews,
    pp.total_bookings,
    pp.is_active,
    pp.is_verified,
    ARRAY_AGG(DISTINCT c.name) as categories,
    COUNT(DISTINCT ps.id) as total_services
FROM provider_profiles pp
LEFT JOIN provider_categories pc ON pp.id = pc.provider_id
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN provider_services ps ON pp.id = ps.provider_id AND ps.is_active = true
WHERE pp.is_active = true
GROUP BY pp.id, pp.user_id, pp.business_name, pp.description, pp.phone, pp.city, 
         pp.average_rating, pp.total_reviews, pp.total_bookings, pp.is_active, pp.is_verified;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- Database schema creation completed successfully!
-- Next steps:
-- 1. Run this script in your Supabase SQL editor
-- 2. Create users through Supabase Auth
-- 3. Add provider profiles and services
-- 4. Configure storage buckets for images
-- 5. Set up email templates for notifications