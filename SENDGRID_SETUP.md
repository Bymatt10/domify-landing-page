# 📧 Configuración de SendGrid para Domify

## 🚀 Pasos para configurar SendGrid

### 1. Crear cuenta en SendGrid
- Ve a [sendgrid.com](https://sendgrid.com)
- Crea una cuenta gratuita (permite 100 emails/día)
- Verifica tu email

### 2. Obtener API Key
1. En SendGrid Dashboard → **Settings** → **API Keys**
2. Click **Create API Key**
3. Selecciona **Full Access** (o **Restricted Access** con permisos de Mail Send)
4. Dale un nombre como "Domify Production"
5. **Copia la API key** (solo se muestra una vez)

### 3. Configurar variables de entorno
Agrega estas líneas a tu archivo `.env`:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.tu-api-key-aqui
FROM_EMAIL=noreply@tudominio.com
FROM_NAME=Domify
```

### 4. Verificar dominio (recomendado para producción)
1. En SendGrid Dashboard → **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Sigue las instrucciones para verificar tu dominio
4. Esto mejora la deliverability de tus emails

## 🧪 Probar el envío

Una vez configurado, puedes probar:

```bash
# Probar email
curl "http://localhost:5173/api/debug/test-email"

# Probar con email específico
curl "http://localhost:5173/api/debug/test-email?email=tu@email.com"
```

## 📋 Ejemplo de configuración completa

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
PRIVATE_SUPABASE_SERVICE_ROLE_KEY=eyJ...

# SendGrid Configuration
SENDGRID_API_KEY=SG.abcd1234...
FROM_EMAIL=noreply@domify.com
FROM_NAME=Domify

# App Configuration
PUBLIC_APP_URL=http://localhost:5173
```

## ✅ Verificar que funciona

Si todo está configurado correctamente, verás en los logs:

```
📧 Enviando email con SendGrid...
To: usuario@ejemplo.com
From: noreply@domify.com
Subject: ¡Bienvenido a Domify! - Tu cuenta ha sido aprobada
✅ Email enviado exitosamente
```

## 🚨 Troubleshooting

### Error: "The provided authorization grant is invalid"
- Verifica que tu SENDGRID_API_KEY esté correcta
- Asegúrate de que no tenga espacios extra

### Error: "The from address does not match a verified Sender Identity"
- Verifica tu dominio en SendGrid
- O usa un email que hayas verificado individualmente

### Emails van a spam
- Verifica tu dominio en SendGrid
- Configura SPF, DKIM y DMARC records
- Usa un dominio profesional (no gmail.com)

## 📈 Límites del plan gratuito

- **100 emails/día** gratis
- Para más volumen, considera un plan pago
- Puedes monitorear el uso en SendGrid Dashboard 