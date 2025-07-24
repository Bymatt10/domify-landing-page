# Configuración del Entorno Local

## Problema Actual
El sistema está mostrando errores 401 (Unauthorized) porque las variables de entorno de Supabase no están configuradas correctamente para desarrollo local.

## Solución

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# SMTP Configuration (opcional para desarrollo)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=tu_smtp_user
SMTP_PASS=tu_smtp_password
FROM_EMAIL=noreply@domify.app

# Site Configuration
PUBLIC_SITE_URL=http://localhost:5173
```

### 2. Obtener las Claves de Supabase

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard/project/[TU_PROJECT_ID]/settings/api
2. Copia los valores de:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon public** → `PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Verificar la Configuración

Una vez configuradas las variables, puedes verificar el estado con estos endpoints:

```bash
# Verificar variables de entorno
curl http://localhost:5173/api/debug/check-env

# Probar conexión con Supabase
curl http://localhost:5173/api/debug/test-supabase-connection
```

### 4. Reiniciar el Servidor

Después de crear el archivo `.env`, reinicia el servidor de desarrollo:

```bash
npm run dev
```

## Funcionamiento Dinámico

El sistema ahora está configurado para funcionar tanto en local como en producción:

### Desarrollo Local
- Usa el archivo `.env` para las variables de entorno
- Si no encuentra las claves, usa valores de fallback
- Los endpoints funcionan con la clave anónima si no hay service role

### Producción (Jenkins)
- Usa las variables de entorno configuradas en Jenkins
- Las variables se pasan al contenedor Docker durante el build
- Funciona con la service role key para acceso completo

## Endpoints de Debug

- `/api/debug/check-env` - Estado de las variables de entorno
- `/api/debug/test-supabase-connection` - Prueba de conexión con Supabase
- `/api/debug/check-status` - Estado general del sistema

## Notas Importantes

1. **Seguridad**: Nunca commits el archivo `.env` al repositorio
2. **Fallbacks**: El sistema tiene valores de fallback para evitar errores de build
3. **Autenticación**: En desarrollo local, algunos endpoints pueden funcionar con la clave anónima
4. **Producción**: En producción siempre usa la service role key para acceso completo

## Solución de Problemas

### Error 401 Unauthorized
- Verifica que las claves de Supabase estén correctas
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto
- Reinicia el servidor después de cambiar las variables

### Error de Conexión
- Verifica que la URL de Supabase sea correcta
- Comprueba que las claves tengan el formato correcto
- Usa los endpoints de debug para diagnosticar problemas 