-- Agregar columna portfolio a la tabla provider_profiles
-- Ejecuta esto en el SQL Editor de Supabase

-- Agregar la columna portfolio como JSONB para almacenar un array de trabajos
ALTER TABLE provider_profiles 
ADD COLUMN IF NOT EXISTS portfolio JSONB DEFAULT '[]'::jsonb;

-- Verificar que la columna se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'provider_profiles' 
AND column_name = 'portfolio';

-- Mostrar la estructura actualizada de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'provider_profiles' 
ORDER BY ordinal_position; 