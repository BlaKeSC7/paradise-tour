-- Migración: Accesorios/recomendaciones opcionales por tour
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de accesorios opcionales (ej. pasamontañas, pañuelos, cámara acuática, etc.)
CREATE TABLE IF NOT EXISTS tour_extras (
    id TEXT PRIMARY KEY,
    tour_id TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tour_extras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view tour extras" ON tour_extras;
CREATE POLICY "Public can view tour extras"
  ON tour_extras FOR SELECT
  USING (true);

-- Guardar los accesorios elegidos en cada reserva
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'extras'
  ) THEN
    ALTER TABLE bookings ADD COLUMN extras JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Accesorios de ejemplo para los tours sembrados en supabase-schema.sql.
-- Editalos o agregá los tuyos desde el SQL Editor (todavía no hay UI de administración para esto).
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
