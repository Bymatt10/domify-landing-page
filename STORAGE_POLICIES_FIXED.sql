-- Políticas RLS para el bucket de almacenamiento "domify" - VERSIÓN CORREGIDA
-- Ejecuta estas consultas en el SQL Editor de Supabase

-- Primero, eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Public read access to domify bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload files to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- Ahora crear las políticas nuevas

-- 1. Política para lectura pública de archivos en el bucket domify
CREATE POLICY "Public read access to domify bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'domify');

-- 2. Política para permitir a usuarios subir archivos a su propia carpeta
-- La estructura es: domify/providers/[user_id]/portfolio/[filename]
-- Por eso usamos [2] para obtener el user_id (providers es [1], user_id es [2])
CREATE POLICY "Users can upload files to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'domify' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);

-- 3. Política para permitir a usuarios eliminar sus propios archivos
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'domify' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);

-- 4. Política para permitir a usuarios actualizar sus propios archivos
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'domify' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Verificar que las políticas se crearon correctamente
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%domify%'
ORDER BY policyname; 
