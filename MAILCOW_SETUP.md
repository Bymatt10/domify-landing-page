# Configuración de Mailcow para Domify

Esta guía te ayudará a configurar Mailcow para enviar correos desde tu aplicación Domify usando el correo `info@domify.app`.

## 📋 Requisitos Previos

- Servidor Mailcow instalado y funcionando
- Correo `info@domify.app` configurado en Mailcow
- Acceso al panel de administración de Mailcow

## 🔧 Configuración del Archivo .env

Crea un archivo `.env` en la raíz de tu proyecto con la siguiente configuración:

```bash
# Mailcow SMTP Configuration
SMTP_HOST=mail.domify.app
SMTP_PORT=587
SMTP_USER=info@domify.app
SMTP_PASS=tu_contraseña_de_mailcow
FROM_EMAIL=info@domify.app
ADMIN_EMAIL=admin@domify.app
```

### Configuración Alternativa para SSL

Si prefieres usar SSL en lugar de TLS, cambia el puerto:

```bash
SMTP_PORT=465
```

## 🚀 Configuración en Mailcow

### 1. Verificar Configuración del Dominio

1. Accede al panel de administración de Mailcow
2. Ve a **Configuration** → **Domains**
3. Asegúrate de que `domify.app` esté configurado correctamente
4. Verifica que los registros DNS estén configurados:
   - `MX` → `mail.domify.app`
   - `A` → `mail.domify.app` → IP de tu servidor
   - `TXT` → SPF record: `v=spf1 mx a:mail.domify.app ~all`

### 2. Configurar el Correo info@domify.app

1. Ve a **Mailbox** → **Add Mailbox**
2. Configura el correo:
   - **Local part**: `info`
   - **Domain**: `domify.app`
   - **Password**: Genera una contraseña segura
   - **Quota**: Configura según tus necesidades
3. Guarda la configuración

### 3. Configurar Autenticación SMTP

1. Ve a **Configuration** → **SMTP**
2. Asegúrate de que SMTP esté habilitado
3. Verifica la configuración de autenticación:
   - **SMTP Auth**: Habilitado
   - **TLS**: Habilitado
   - **Puerto 587**: Habilitado para STARTTLS
   - **Puerto 465**: Habilitado para SSL (opcional)

## 🧪 Probar la Configuración

### Opción 1: Usando la Página de Administración

1. Inicia tu aplicación Domify
2. Ve a `http://localhost:5173/admin/test-mailcow`
3. Haz clic en "Probar Configuración Mailcow"
4. Revisa tu correo `info@domify.app` para confirmar que recibiste el email de prueba

### Opción 2: Usando la API Directamente

```bash
curl -X POST http://localhost:5173/api/test-mailcow \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}'
```

### Opción 3: Usando el Terminal

```bash
# Desde la raíz del proyecto
npm run dev

# En otra terminal, prueba la conexión
curl -X POST http://localhost:5173/api/test-mailcow \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}'
```

## 🔍 Solución de Problemas

### Error de Autenticación

```
Error: Invalid login
```

**Solución:**
- Verifica que el usuario y contraseña en `.env` sean correctos
- Asegúrate de que el correo `info@domify.app` esté activo en Mailcow
- Verifica que SMTP Auth esté habilitado en Mailcow

### Error de Conexión

```
Error: connect ECONNREFUSED
```

**Solución:**
- Verifica que el servidor Mailcow esté funcionando
- Confirma que el host `mail.domify.app` resuelva correctamente
- Verifica que los puertos 587 o 465 estén abiertos en el firewall

### Error de Certificado

```
Error: self signed certificate
```

**Solución:**
- La configuración actual ya maneja certificados autofirmados
- Si persiste, verifica la configuración TLS en Mailcow
- Considera usar un certificado SSL válido

### Error de Puerto

```
Error: connect ETIMEDOUT
```

**Solución:**
- Verifica que el puerto 587 esté abierto
- Prueba con el puerto 465 (SSL)
- Confirma que el firewall no esté bloqueando la conexión

## 📧 Tipos de Correos que se Enviarán

Con esta configuración, tu aplicación Domify podrá enviar:

1. **Emails de bienvenida** a nuevos proveedores
2. **Notificaciones** de nuevas solicitudes de proveedores
3. **Confirmaciones** de formularios de contacto
4. **Notificaciones** de importación masiva
5. **Emails de administración** y alertas

## 🔒 Seguridad

### Recomendaciones

1. **Usa contraseñas fuertes** para el correo en Mailcow
2. **Habilita autenticación de dos factores** si es posible
3. **Configura SPF, DKIM y DMARC** para mejorar la entregabilidad
4. **Monitorea los logs** de Mailcow regularmente
5. **Mantén actualizado** tu servidor Mailcow

### Variables de Entorno

Asegúrate de que el archivo `.env` esté en `.gitignore` para no exponer las credenciales:

```bash
# .gitignore
.env
.env.local
.env.production
```

## 📊 Monitoreo

### Logs de la Aplicación

Los logs de envío de correos aparecerán en la consola:

```bash
✅ Conexión SMTP con Mailcow verificada correctamente
✅ Email de prueba enviado correctamente con Mailcow
```

### Logs de Mailcow

Puedes revisar los logs de Mailcow para verificar el envío:

```bash
# En el servidor Mailcow
docker-compose logs -f postfix
docker-compose logs -f dovecot
```

## 🚀 Despliegue en Producción

### Variables de Entorno en Producción

Asegúrate de configurar las variables de entorno en tu servidor de producción:

```bash
# En tu servidor de producción
export SMTP_HOST=mail.domify.app
export SMTP_PORT=587
export SMTP_USER=info@domify.app
export SMTP_PASS=tu_contraseña_segura
export FROM_EMAIL=info@domify.app
export ADMIN_EMAIL=admin@domify.app
```

### Verificación Final

1. Ejecuta la prueba de configuración en producción
2. Verifica que los correos lleguen correctamente
3. Revisa los logs de la aplicación
4. Confirma que no hay errores en los logs de Mailcow

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa los logs de la aplicación
2. Verifica la configuración de Mailcow
3. Confirma que las variables de entorno estén correctas
4. Prueba la conexión SMTP manualmente

---

**Nota:** Esta configuración asume que tienes Mailcow instalado y funcionando correctamente. Si necesitas ayuda con la instalación de Mailcow, consulta la [documentación oficial](https://mailcow.github.io/mailcow-dockerized-docs/). 