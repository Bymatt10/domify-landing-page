# Configuración de Variables de Entorno en Portainer

## Variables de Entorno Requeridas

Configura estas variables en Portainer al crear/editar el container:

### Configuración de Supabase
```
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aquí
PRIVATE_SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aquí
```

### Configuración de SMTP
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password_aquí
FROM_EMAIL=noreply@tudominio.com
```

### Variables del Sistema (ya incluidas en docker-compose.yml)
```
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

## Pasos para Configurar en Portainer

### Opción 1: Usar Stack (Recomendado)
1. En Portainer, ve a **Stacks**
2. Crea un nuevo stack llamado "domify"
3. Pega el contenido del `docker-compose.yml`
4. En la sección **Environment variables**, agrega todas las variables listadas arriba
5. Click **Deploy the stack**

### Opción 2: Container Individual
1. En Portainer, ve a **Containers**
2. Click **Add container**
3. Configura:
   - **Name**: `domify-app`
   - **Image**: `tu-registry/domify:latest`
   - **Port mapping**: `3000:3000`
4. En **Advanced container settings** > **Env**:
   - Agrega cada variable de entorno una por una
5. Click **Deploy the container**

## Ventajas de esta Configuración

✅ **Seguridad**: Variables sensibles no están en el código
✅ **Flexibilidad**: Cambiar configuración sin redeployar
✅ **Centralizado**: Toda la configuración en un lugar
✅ **Fácil gestión**: Interfaz web amigable

## Comandos para Build Manual (si es necesario)

Si necesitas hacer build manual:

```bash
# Build de la imagen
docker build -t domify:latest .

# Tag para registry
docker tag domify:latest tu-registry/domify:latest

# Push al registry
docker push tu-registry/domify:latest
```

## Troubleshooting

### Si el container no inicia:
1. Verifica que todas las variables estén configuradas
2. Revisa los logs del container en Portainer
3. Verifica conectividad a Supabase y SMTP

### Variables comunes que faltan:
- `PUBLIC_SUPABASE_URL` debe incluir `https://`
- `SMTP_PORT` debe ser numérico (587, 465, etc.)
- `PRIVATE_SUPABASE_SERVICE_ROLE_KEY` es diferente del anon key 