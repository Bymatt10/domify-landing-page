# Configuración de Zoho Email para Domify

## 📧 Configuración de Zoho Email

Este documento explica cómo configurar Zoho Email para el formulario de contacto de Domify.

## 🔧 Pasos de Configuración

### 1. Crear cuenta en Zoho Mail

1. Ve a [Zoho Mail](https://www.zoho.com/mail/)
2. Crea una cuenta gratuita o de pago
3. Verifica tu dominio o usa el dominio de Zoho

### 2. Configurar SMTP en Zoho

1. Inicia sesión en tu cuenta de Zoho Mail
2. Ve a **Configuración** > **Configuración de correo**
3. Busca la sección **SMTP**
4. Anota la configuración:
   - **Servidor SMTP**: `smtp.zoho.com`
   - **Puerto**: `587` (TLS) o `465` (SSL)
   - **Usuario**: Tu email completo
   - **Contraseña**: Tu contraseña de aplicación

### 3. Crear Contraseña de Aplicación

1. Ve a **Configuración** > **Seguridad**
2. Busca **Contraseñas de aplicación**
3. Crea una nueva contraseña para la aplicación
4. Usa esta contraseña en lugar de tu contraseña principal

### 4. Configurar Variables de Entorno

Edita tu archivo `.env.local` con la siguiente configuración:

```bash
# Zoho Email SMTP Configuration
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=tu_email@zoho.com
SMTP_PASS=tu_password_de_aplicacion
FROM_EMAIL=tu_email@zoho.com
```

### 5. Reiniciar el Servidor

```bash
# Detener el servidor actual
pkill -f "npm run dev"

# Iniciar el servidor nuevamente
npm run dev
```

## 🧪 Verificación

Ejecuta el script de verificación:

```bash
./verify-zoho-email.sh
```

Deberías ver:
- `smtp_configured: true`
- `from_email: tu_email@zoho.com`
- `success: true` en el envío de email

## 📝 Configuración del Formulario

El formulario de contacto está disponible en:
- **URL**: `http://localhost:5173/contact`
- **Endpoint API**: `http://localhost:5173/api/contact`

### Campos del Formulario

- **Nombre** (requerido)
- **Email** (requerido, validado)
- **Asunto** (requerido, mínimo 3 caracteres)
- **Mensaje** (requerido, mínimo 10 caracteres)

### Funcionalidades

- ✅ Validación de campos
- ✅ Envío de email a `contact@domify.app`
- ✅ Email de confirmación al usuario
- ✅ Pre-llenado para usuarios autenticados
- ✅ Manejo de errores
- ✅ Logs de debugging

## 🔍 Debugging

### Verificar Configuración SMTP

```bash
curl http://localhost:5173/api/debug/check-sendgrid
```

### Probar Envío de Email

```bash
curl -X POST http://localhost:5173/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test message"
  }'
```

## 🚨 Solución de Problemas

### Error: "Configuración de email no disponible"

1. Verifica que todas las variables SMTP estén configuradas
2. Asegúrate de que el archivo `.env.local` existe
3. Reinicia el servidor después de cambiar las variables

### Error: "Authentication failed"

1. Verifica que el usuario y contraseña sean correctos
2. Usa una contraseña de aplicación, no tu contraseña principal
3. Asegúrate de que el email esté verificado en Zoho

### Error: "Connection timeout"

1. Verifica que el puerto sea correcto (587 para TLS, 465 para SSL)
2. Asegúrate de que no haya firewall bloqueando la conexión
3. Prueba con `secure: true` para puerto 465

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa los logs del servidor
2. Ejecuta el script de verificación
3. Verifica la configuración SMTP en Zoho
4. Contacta al equipo de desarrollo

## 🔄 Migración desde SendGrid

Si estás migrando desde SendGrid:

1. Actualiza las variables de entorno
2. Cambia `SENDGRID_API_KEY` por las variables SMTP
3. Reinicia el servidor
4. Ejecuta las pruebas de verificación

---

**Nota**: Asegúrate de mantener seguras tus credenciales de Zoho y no compartirlas en el código fuente. 