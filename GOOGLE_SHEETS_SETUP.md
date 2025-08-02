# 🔗 Integración con Google Sheets - Domify

Esta integración permite que las solicitudes de proveedores se agreguen automáticamente a un Google Sheets y envíen notificaciones por email.

## 📋 Configuración Requerida

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Google Sheets API
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Email del administrador para notificaciones
ADMIN_EMAIL=admin@domify.app
```

### 2. Configurar Google Sheets API

#### Paso 1: Crear Proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Sheets API**

#### Paso 2: Crear Cuenta de Servicio
1. Ve a "IAM & Admin" > "Service Accounts"
2. Haz clic en "Create Service Account"
3. Dale un nombre como "domify-sheets-integration"
4. Asigna el rol "Editor" para Google Sheets
5. Crea y descarga la clave JSON

#### Paso 3: Configurar Google Sheets
1. Abre tu Google Sheets: https://docs.google.com/spreadsheets/d/1f8-trfDtnOchxvKid3L1r4hoV2IX5R1SXfnwp_QF7rI/edit?usp=sharing
2. Comparte el documento con el email de la cuenta de servicio (está en el JSON descargado)
3. Dale permisos de "Editor"

#### Paso 4: Configurar Credenciales
1. Copia el contenido del archivo JSON descargado
2. Pégalo como valor de `GOOGLE_SHEETS_CREDENTIALS` en tu `.env`
3. **Importante**: Escapa las comillas dobles si es necesario

## 🚀 Funcionalidades

### 1. Agregar Solicitudes Automáticamente
Cuando alguien envía una solicitud de proveedor:
- ✅ Se guarda en la base de datos
- ✅ Se agrega automáticamente al Google Sheets
- ✅ Se envía email de notificación al admin

### 2. Estructura del Google Sheets
El sistema agrega filas con esta estructura:

| Columna | Descripción |
|---------|-------------|
| A | Timestamp |
| B | ID de Aplicación |
| C | Nombre |
| D | Apellido |
| E | Email |
| F | Teléfono |
| G | Departamento |
| H | Dirección |
| I | Tipo de Proveedor |
| J | Título |
| K | Descripción |
| L | Precio por Hora |
| M | Años de Experiencia |
| N | Disponibilidad |
| O | Categorías |
| P | Estado |
| Q | Fecha de Creación |
| R | Estado de Revisión |

### 3. Email de Notificación
El admin recibe un email con:
- 📊 Resumen de la solicitud
- 🔗 Enlace directo al Google Sheets
- 📋 Información completa del proveedor

## 🔧 Endpoints Disponibles

### Para Admins

#### Obtener Solicitudes desde Google Sheets
```http
GET /api/admin/applications-from-sheets
```

#### Sincronizar Estado de Aplicación
```http
POST /api/admin/sync-applications-status
Content-Type: application/json

{
  "applicationId": "uuid",
  "status": "approved|rejected|pending",
  "adminNotes": "Notas opcionales"
}
```

#### Actualizar Estado de Aplicación
```http
POST /api/admin/update-application-status
Content-Type: application/json

{
  "applicationId": "uuid",
  "status": "approved|rejected|pending|under_review",
  "adminNotes": "Notas opcionales"
}
```

## 📧 Configuración de Email

### Variables SMTP (ya configuradas)
```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=tu-email@zoho.com
SMTP_PASS=tu-password
FROM_EMAIL=noreply@domify.app
```

## 🛠️ Solución de Problemas

### Error: "Google Sheets credentials not found"
- Verifica que `GOOGLE_SHEETS_CREDENTIALS` esté configurado
- Asegúrate de que el JSON esté correctamente escapado

### Error: "Permission denied"
- Verifica que la cuenta de servicio tenga permisos de "Editor" en el Google Sheets
- Confirma que el email de la cuenta de servicio esté agregado al documento

### Error: "Spreadsheet not found"
- Verifica que el ID del spreadsheet sea correcto
- Confirma que el documento esté compartido con la cuenta de servicio

### Emails no se envían
- Verifica la configuración SMTP
- Revisa los logs del servidor para errores específicos

## 🔒 Seguridad

- Las credenciales de Google Sheets están encriptadas
- Solo los admins pueden acceder a los endpoints de gestión
- Los errores de integración no bloquean el flujo principal
- Las notificaciones por email son opcionales

## 📝 Notas Importantes

1. **No bloqueante**: Si Google Sheets falla, la solicitud se guarda normalmente
2. **Sincronización**: Los cambios se reflejan en ambos lugares (DB y Sheets)
3. **Backup**: Google Sheets sirve como backup de las solicitudes
4. **Auditoría**: Todas las acciones quedan registradas con timestamps

## 🎯 Próximos Pasos

- [ ] Agregar webhooks para actualizaciones en tiempo real
- [ ] Implementar filtros y búsqueda en el admin panel
- [ ] Agregar exportación a Excel/PDF
- [ ] Implementar notificaciones push 