  -- Script SQL para crear las tablas en Supabase
  -- Ejecuta este script en el SQL Editor de tu proyecto Supabase

  -- Tabla de Tours
  CREATE TABLE IF NOT EXISTS tours (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    duration TEXT NOT NULL,
    price_adult DECIMAL(10, 2) NOT NULL,
    price_child DECIMAL(10, 2) NOT NULL,
    price_infant DECIMAL(10, 2) NOT NULL DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    includes JSONB DEFAULT '[]'::jsonb,
    rating DECIMAL(3, 1) DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Tabla de Combos
  CREATE TABLE IF NOT EXISTS combos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tour_ids TEXT[] NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    discounted_price DECIMAL(10, 2) NOT NULL,
    discount INTEGER NOT NULL,
    image TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Tabla de Reseñas
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tour_id TEXT REFERENCES tours(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Tabla de Reservas
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    booking_number TEXT UNIQUE NOT NULL,
    tour_id TEXT REFERENCES tours(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    booking_date DATE NOT NULL,
    adults INTEGER NOT NULL DEFAULT 0,
    children INTEGER NOT NULL DEFAULT 0,
    infants INTEGER NOT NULL DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    referral_code TEXT,
    extras JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Tabla de Accesorios/Recomendaciones opcionales por tour (ej. pasamontañas, pañuelos, etc.)
  CREATE TABLE IF NOT EXISTS tour_extras (
    id TEXT PRIMARY KEY,
    tour_id TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

-- Tabla de Usuarios del Dashboard (Afiliados/Referidos)
CREATE TABLE IF NOT EXISTS dashboard_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referral_link TEXT NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'affiliate' CHECK (role IN ('admin', 'affiliate', 'manager')),
  total_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  commission_rate DECIMAL(5, 2) DEFAULT 10.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

  -- Tabla de Referidos (para tracking de referencias)
  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    dashboard_user_id TEXT REFERENCES dashboard_users(id) ON DELETE CASCADE,
    booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    commission_amount DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
  );

  -- Habilitar Row Level Security (RLS)
  ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
  ALTER TABLE combos ENABLE ROW LEVEL SECURITY;
  ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
  ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE dashboard_users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
  ALTER TABLE tour_extras ENABLE ROW LEVEL SECURITY;

  -- Eliminar políticas existentes si existen (para evitar errores al re-ejecutar)
  DROP POLICY IF EXISTS "Allow public read access on tours" ON tours;
  DROP POLICY IF EXISTS "Allow public update tours" ON tours;
  DROP POLICY IF EXISTS "Allow public insert tours" ON tours;
  DROP POLICY IF EXISTS "Allow public delete tours" ON tours;
  DROP POLICY IF EXISTS "Allow public read access on combos" ON combos;
DROP POLICY IF EXISTS "Allow public read access on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public insert on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public update reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public delete reviews" ON reviews;
  DROP POLICY IF EXISTS "Allow public read own bookings" ON bookings;
  DROP POLICY IF EXISTS "Allow public insert bookings" ON bookings;
  DROP POLICY IF EXISTS "Allow public read active dashboard users" ON dashboard_users;
  DROP POLICY IF EXISTS "Allow public read referrals" ON referrals;

  -- Políticas de seguridad: Permitir lectura pública
  CREATE POLICY "Allow public read access on tours" ON tours
    FOR SELECT USING (true);

  -- Políticas para actualización de tours (solo para usuarios del dashboard activos)
  -- Nota: Esta política permite actualización pública. En producción, deberías usar
  -- autenticación de Supabase Auth y verificar el rol del usuario.
  CREATE POLICY "Allow public update tours" ON tours
    FOR UPDATE USING (true)
    WITH CHECK (true);

  CREATE POLICY "Allow public insert tours" ON tours
    FOR INSERT WITH CHECK (true);

  CREATE POLICY "Allow public delete tours" ON tours
    FOR DELETE USING (true);

  CREATE POLICY "Allow public read access on combos" ON combos
    FOR SELECT USING (true);

  CREATE POLICY "Allow public read access on reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Políticas para actualización y eliminación de reseñas (para dashboard)
CREATE POLICY "Allow public update reviews" ON reviews
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete reviews" ON reviews
  FOR DELETE USING (true);

  -- Políticas para reservas: lectura y creación pública, actualización solo para admins
  CREATE POLICY "Allow public read own bookings" ON bookings
    FOR SELECT USING (true);

  CREATE POLICY "Allow public insert bookings" ON bookings
    FOR INSERT WITH CHECK (true);

-- Políticas para usuarios del dashboard: solo lectura pública de códigos activos
DROP POLICY IF EXISTS "Allow public read active dashboard users" ON dashboard_users;
DROP POLICY IF EXISTS "Allow public insert dashboard users" ON dashboard_users;
DROP POLICY IF EXISTS "Allow public update dashboard users" ON dashboard_users;

CREATE POLICY "Allow public read active dashboard users" ON dashboard_users
  FOR SELECT USING (is_active = true);

-- Permitir inserción y actualización de usuarios del dashboard (para el dashboard admin)
CREATE POLICY "Allow public insert dashboard users" ON dashboard_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update dashboard users" ON dashboard_users
  FOR UPDATE USING (true)
  WITH CHECK (true);

  -- Políticas para referidos: lectura pública limitada
  CREATE POLICY "Allow public read referrals" ON referrals
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Allow public read access on tour_extras" ON tour_extras;
  CREATE POLICY "Allow public read access on tour_extras" ON tour_extras
    FOR SELECT USING (true);

  -- Insertar datos de ejemplo (opcional - solo si no existen)
  -- Usar ON CONFLICT para evitar errores si los datos ya existen
  INSERT INTO tours (id, title, description, category, image, duration, price_adult, price_child, price_infant, featured, includes, rating, reviews) VALUES
    ('1', 'Snorkel en Arrecife de Coral', 'Explora el vibrante mundo submarino con peces tropicales, tortugas y arrecifes de coral espectaculares. Tour guiado con todo el equipo incluido.', 'Acuático', '/images/tour-snorkeling.jpg', '4 horas', 89, 59, 0, true, '["Equipo de snorkel", "Guía certificado", "Refrigerios", "Transporte"]', 4.9, 234),
    ('2', 'Paseo en Catamarán al Atardecer', 'Disfruta de un relajante paseo en catamarán mientras el sol se pone sobre el océano. Incluye bebidas y música en vivo.', 'Crucero', '/images/tour-catamaran.jpg', '3 horas', 129, 89, 0, true, '["Bebidas ilimitadas", "Música en vivo", "Cena ligera", "Transporte"]', 5.0, 189),
    ('3', 'Tour Ruinas Mayas', 'Viaja en el tiempo visitando antiguas ruinas mayas. Aprende sobre la fascinante historia y cultura con guías expertos.', 'Cultural', '/images/tour-ruins.jpg', '6 horas', 99, 69, 0, true, '["Guía arqueólogo", "Entradas", "Almuerzo", "Transporte"]', 4.8, 312),
    ('4', 'Aventura en la Selva - Tirolesa', 'Adrenalina pura volando entre los árboles en nuestras tirolesas de última generación. Incluye rappel y puentes colgantes.', 'Aventura', '/images/tour-adventure.jpg', '5 horas', 119, 89, 0, true, '["Equipo de seguridad", "Instructor", "Refrigerios", "Transporte", "Fotos digitales"]', 4.9, 267)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO combos (id, title, description, tour_ids, original_price, discounted_price, discount, image) VALUES
    ('combo-1', 'Aventura Completa', 'Snorkel en Arrecife de Coral + Tour en Catamarán - El combo perfecto para disfrutar del mar', ARRAY['1', '2'], 180, 150, 17, '/images/tour-snorkeling.jpg'),
    ('combo-2', 'Cultura y Naturaleza', 'Ruinas Mayas + Aventura en la Selva - Descubre la historia y la naturaleza', ARRAY['3', '4'], 200, 165, 18, '/images/tour-ruins.jpg')
  ON CONFLICT (id) DO NOTHING;

  -- Insertar accesorios de ejemplo (editalos o agregá los tuyos desde el SQL Editor)
  INSERT INTO tour_extras (id, tour_id, name, description, price) VALUES
    ('extra-1', '1', 'Cámara acuática desechable', 'Llevate fotos bajo el agua sin arriesgar tu celular', 15),
    ('extra-2', '1', 'Alquiler de traje de neopreno', 'Más comodidad y calor en el agua', 10),
    ('extra-3', '2', 'Paquete de fotos profesionales', 'Sesión de fotos durante el paseo, con edición incluida', 25),
    ('extra-4', '3', 'Guía privado', 'Tour exclusivo solo para tu grupo', 40),
    ('extra-5', '3', 'Sombrero de sol', 'Protección extra durante el recorrido', 8),
    ('extra-6', '4', 'Pasamontañas de protección', 'Protección facial para la tirolesa', 6),
    ('extra-7', '4', 'Pañuelo/buff multiusos', 'Protección para cuello y rostro', 5),
    ('extra-8', '4', 'Guantes de seguridad', 'Mejor agarre en tirolesas y rappel', 7)
  ON CONFLICT (id) DO NOTHING;

  -- Insertar reseñas de ejemplo
  INSERT INTO reviews (id, tour_id, name, email, rating, comment, verified) VALUES
    ('review-1', '1', 'María González', 'maria@example.com', 5, '¡Experiencia increíble! El tour de snorkel fue maravilloso, guías muy profesionales.', true),
    ('review-2', '2', 'Carlos Rodríguez', 'carlos@example.com', 5, 'El mejor tour que he tomado. Totalmente recomendado, volveremos pronto.', true),
    ('review-3', '1', 'Ana Martínez', 'ana@example.com', 4, 'Muy buena experiencia, solo que el tour fue un poco corto. Pero todo excelente.', true)
  ON CONFLICT (id) DO NOTHING;

  -- Eliminar funciones y triggers existentes si existen
  DROP TRIGGER IF EXISTS set_booking_number_trigger ON bookings;
  DROP TRIGGER IF EXISTS set_referral_info_trigger ON dashboard_users;
  DROP TRIGGER IF EXISTS update_referral_stats_trigger ON bookings;
  DROP FUNCTION IF EXISTS generate_booking_number();
  DROP FUNCTION IF EXISTS set_booking_number();
  DROP FUNCTION IF EXISTS generate_referral_code(TEXT);
  DROP FUNCTION IF EXISTS set_referral_info();
  DROP FUNCTION IF EXISTS update_referral_stats();

  -- Función para generar número de reserva único
  CREATE OR REPLACE FUNCTION generate_booking_number()
  RETURNS TEXT AS $$
  BEGIN
    RETURN 'BK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END;
  $$ LANGUAGE plpgsql;

  -- Trigger para generar número de reserva automáticamente
  CREATE OR REPLACE FUNCTION set_booking_number()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
      NEW.booking_number := generate_booking_number();
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER set_booking_number_trigger
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_booking_number();

  -- Función para generar código de referido único
  CREATE OR REPLACE FUNCTION generate_referral_code(name TEXT)
  RETURNS TEXT AS $$
  DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 0;
  BEGIN
    -- Crear código base desde el nombre
    base_code := UPPER(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'));
    IF LENGTH(base_code) > 6 THEN
      base_code := SUBSTRING(base_code, 1, 6);
    END IF;
    
    -- Asegurar que tenga al menos 6 caracteres
    WHILE LENGTH(base_code) < 6 LOOP
      base_code := base_code || FLOOR(RANDOM() * 10)::TEXT;
    END LOOP;
    
    -- Agregar números aleatorios
    base_code := base_code || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    
    -- Verificar unicidad
    final_code := base_code;
    WHILE EXISTS (SELECT 1 FROM dashboard_users WHERE referral_code = final_code) LOOP
      final_code := base_code || LPAD(counter::TEXT, 2, '0');
      counter := counter + 1;
    END LOOP;
    
    RETURN final_code;
  END;
  $$ LANGUAGE plpgsql;

  -- Trigger para generar código de referido y link automáticamente
  CREATE OR REPLACE FUNCTION set_referral_info()
  RETURNS TRIGGER AS $$
  DECLARE
    base_url TEXT := 'https://paradise-tour.com/ref/';
  BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
      NEW.referral_code := generate_referral_code(NEW.name);
    END IF;
    
    IF NEW.referral_link IS NULL OR NEW.referral_link = '' THEN
      NEW.referral_link := base_url || NEW.referral_code;
    END IF;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER set_referral_info_trigger
    BEFORE INSERT ON dashboard_users
    FOR EACH ROW
    EXECUTE FUNCTION set_referral_info();

  -- Función para actualizar estadísticas de referidos cuando se crea una reserva
  CREATE OR REPLACE FUNCTION update_referral_stats()
  RETURNS TRIGGER AS $$
  DECLARE
    commission DECIMAL(10, 2);
    user_commission_rate DECIMAL(5, 2);
  BEGIN
    IF NEW.referral_code IS NOT NULL AND NEW.referral_code != '' THEN
      -- Buscar el usuario del dashboard por código de referido
      SELECT commission_rate INTO user_commission_rate
      FROM dashboard_users
      WHERE referral_code = NEW.referral_code AND is_active = true;
      
      IF user_commission_rate IS NOT NULL THEN
        -- Calcular comisión
        commission := NEW.total_price * (user_commission_rate / 100);
        
        -- Crear registro de referido
        INSERT INTO referrals (dashboard_user_id, booking_id, referral_code, commission_amount, status)
        SELECT id, NEW.id, NEW.referral_code, commission, 'pending'
        FROM dashboard_users
        WHERE referral_code = NEW.referral_code AND is_active = true
        LIMIT 1;
        
        -- Actualizar estadísticas del usuario
        UPDATE dashboard_users
        SET 
          total_referrals = total_referrals + 1,
          total_earnings = total_earnings + commission,
          updated_at = NOW()
        WHERE referral_code = NEW.referral_code AND is_active = true;
      END IF;
    END IF;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

CREATE TRIGGER update_referral_stats_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_stats();

-- Insertar usuario de dashboard de ejemplo (código: CDERF)
INSERT INTO dashboard_users (email, name, role, commission_rate, referral_code, referral_link, is_active)
VALUES (
  'admin@paradise-tour.com',
  'Administrador',
  'admin',
  10.00,
  'CDERF',
  'https://paradise-tour.com/ref/CDERF',
  true
)
ON CONFLICT (referral_code) DO UPDATE 
SET is_active = true, email = EXCLUDED.email, name = EXCLUDED.name;

