# Configuración del Bucket de Almacenamiento - Supabase

## Estado Actual
✅ **El bucket "domify" ya está configurado y funcionando correctamente**

El sistema usa el bucket existente "domify" con la estructura:
```
domify/
└── providers/
    └── [user_id]/
        └── portfolio/
            ├── 1234567890-abc123.jpg
            ├── 1234567891-def456.mp4
            └── ...
```

## Solución Manual

### 1. Agregar Columna Portfolio a la Base de Datos ⚠️ **REQUERIDO**

**IMPORTANTE:** Antes de configurar las políticas de storage, necesitas agregar la columna `portfolio` a la tabla `provider_profiles`.

#### Ejecutar SQL para Agregar Columna Portfolio
1. Ve al **SQL Editor** en tu dashboard de Supabase
2. Copia y pega el contenido del archivo `ADD_PORTFOLIO_COLUMN.sql`
3. Ejecuta las consultas

### 2. Acceder al Dashboard de Supabase
1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard/project/[TU_PROJECT_ID]
2. En el menú lateral, haz clic en **"Storage"**

### 2. Verificar el Bucket "domify"
El bucket "domify" ya existe y está configurado correctamente. Si necesitas verificar su configuración:

1. En el dashboard de Supabase, ve a **"Storage"**
2. Verifica que existe el bucket llamado `domify`
3. Confirma que tiene permisos públicos para lectura
4. Verifica que permite subida de archivos de hasta 50MB

### 3. Configurar Políticas RLS (Row Level Security) ⚠️ **REQUERIDO**

**IMPORTANTE:** Sin estas políticas, los usuarios no podrán subir archivos y verás el error "new row violates row-level security policy".

#### Opción A: Ejecutar SQL Manualmente (RECOMENDADO)
1. Ve al **SQL Editor** en tu dashboard de Supabase
2. Copia y pega el contenido del archivo `STORAGE_POLICIES_FIXED.sql`
3. Ejecuta todas las consultas

**Nota:** Este script elimina políticas existentes antes de crear las nuevas, evitando errores de duplicación.

#### Opción B: Copiar las Políticas Individualmente

**Política 1: Lectura Pública**
```sql
CREATE POLICY "Public read access to domify bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'domify');
```

**Política 2: Subida de Archivos**
```sql
CREATE POLICY "Users can upload files to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'domify' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);
```

**Política 3: Eliminación de Archivos**
```sql
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'domify' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);
```

**Política 4: Actualización de Archivos**
```sql
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'domify' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);
```

### 4. Verificar las Políticas

Después de ejecutar las políticas, verifica que se crearon correctamente:

```sql
-- Verificar que las políticas existen
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%domify%'
ORDER BY policyname;
```

Deberías ver 4 políticas:
- `Public read access to domify bucket`
- `Users can upload files to their own folder`
- `Users can delete their own files`
- `Users can update their own files`

### 5. Verificar la Configuración

Una vez configurado, puedes verificar que funciona con estos endpoints:

```bash
# Verificar estado del bucket
curl http://localhost:5173/api/debug/check-storage-bucket

# Probar subida de archivo (desde la interfaz web)
# Ve a: http://localhost:5173/provider/portfolio
```

## Estructura de Carpetas

El sistema organizará los archivos así:
```
domify/
└── providers/
    ├── [user_id_1]/
    │   └── portfolio/
    │       ├── 1234567890-abc123.jpg
    │       ├── 1234567891-def456.mp4
    │       └── ...
    ├── [user_id_2]/
    │   └── portfolio/
    │       ├── 1234567892-ghi789.png
    │       └── ...
    └── ...
```

## Configuración Automática (Producción)

En producción, el bucket se creará automáticamente usando la service role key configurada en Jenkins.

## Solución de Problemas

### Error: "new row violates row-level security policy"
- **Causa**: Las políticas RLS no están configuradas correctamente
- **Solución**: Ejecutar las políticas SQL mencionadas arriba

### Error: "column provider_profiles.portfolio does not exist"
- **Causa**: La columna `portfolio` no existe en la tabla `provider_profiles`
- **Solución**: Ejecutar el archivo `ADD_PORTFOLIO_COLUMN.sql` para agregar la columna

### Error: "policy already exists"
- **Causa**: Las políticas RLS ya existen en la base de datos
- **Solución**: Usar el archivo `STORAGE_POLICIES_FIXED.sql` que elimina las políticas existentes antes de crear las nuevas

### Error: "Bucket not found"
- **Causa**: El bucket "domify" no existe
- **Solución**: El bucket ya existe, verificar la configuración en el dashboard de Supabase

### Error: "File size too large"
- **Causa**: El archivo excede el límite de 50MB
- **Solución**: Comprimir el archivo o usar uno más pequeño

### Error: "Invalid file type"
- **Causa**: Tipo de archivo no permitido
- **Solución**: Usar solo imágenes (JPG, PNG, WebP) o videos (MP4, WebM, OGG)

## Tipos de Archivo Soportados

### Imágenes
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### Videos
- MP4 (.mp4)
- WebM (.webm)
- OGG (.ogg)

## Límites
- **Tamaño máximo**: 50MB por archivo
- **Tipos permitidos**: Solo imágenes y videos
- **Organización**: Un archivo por usuario en carpetas separadas

## Notas de Seguridad
- Los archivos se almacenan en carpetas separadas por usuario
- Solo el propietario puede eliminar sus archivos
- Los archivos son públicos para lectura (necesario para mostrar en el portfolio)
- Se recomienda comprimir archivos grandes antes de subir 