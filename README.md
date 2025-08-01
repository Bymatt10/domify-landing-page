# Domify

A modern service marketplace platform built with SvelteKit.

<!-- Last deployment: 2024-07-30 -->

## 🚀 Características

- **Autenticación**: Sistema de autenticación con Supabase
- **Perfiles de Usuario**: Gestión de perfiles de clientes y proveedores
- **Aplicaciones de Proveedor**: Sistema de solicitudes para convertirse en proveedor
- **Categorías de Servicios**: Organización de servicios por categorías
- **Reseñas y Calificaciones**: Sistema de feedback para proveedores
- **Panel de Administración**: Gestión completa de usuarios y aplicaciones

## 🛠️ Tecnologías

- **Frontend**: SvelteKit
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Autenticación**: Supabase Auth
- **Base de Datos**: PostgreSQL con RLS (Row Level Security)

## 📁 Estructura del Proyecto

```
src/
├── lib/
│   ├── auth-helpers.ts      # Helpers de autenticación
│   ├── auth-middleware.ts   # Middleware de autenticación
│   ├── exceptions.ts        # Manejo de excepciones
│   └── roles.ts            # Gestión de roles y permisos
├── routes/
│   ├── api/
│   │   ├── auth/           # Endpoints de autenticación
│   │   ├── debug/          # Endpoints de debug (solo desarrollo)
│   │   ├── provider-applications/ # Gestión de aplicaciones
│   │   └── providers/      # Gestión de proveedores
│   └── admin/              # Panel de administración
└── static/                 # Archivos estáticos
```

## 🔧 Endpoints de Debug (Solo Desarrollo)

Los siguientes endpoints están disponibles para desarrollo y testing:

### Información del Sistema
- `GET /api/debug` - Información general del sistema
- `GET /api/debug/check-status` - Estado de autenticación y conteos de BD

### Gestión de Aplicaciones
- `GET /api/debug/list-applications` - Listar todas las aplicaciones
- `GET /api/debug/check-application/[id]` - Verificar aplicación específica
- `POST /api/debug/create-test-application` - Crear aplicación de prueba
- `PUT /api/debug/update-application/[id]` - Actualizar aplicación
- `DELETE /api/debug/delete-application/[id]` - Eliminar aplicación

### Gestión de Usuarios
- `POST /api/debug/create-user-profile` - Crear perfil de usuario
- `GET /api/debug/check-provider-profile/[user_id]` - Verificar perfil de proveedor
- `POST /api/debug/create-admin-role` - Crear rol de administrador

### Migración de Datos
- `POST /api/debug/migrate-approved-applications` - Migrar aplicaciones aprobadas a perfiles

## 🗄️ Base de Datos

### Tablas Principales

#### `customers`
- Perfiles de usuarios clientes
- Campos: `user_id`, `first_name`, `last_name`, `role`, `created_at`, `updated_at`

#### `provider_profiles`
- Perfiles de proveedores de servicios
- Campos: `user_id`, `provider_type`, `business_name`, `description`, `hourly_rate`, `phone`, `location`, `rating`, `total_reviews`, `is_verified`, `is_active`

#### `provider_applications`
- Solicitudes para convertirse en proveedor
- Campos: `user_id`, `headline`, `bio`, `hourly_rate`, `location`, `phone`, `experience_years`, `certifications`, `categories`, `availability`, `status`

#### `categories`
- Categorías de servicios disponibles
- Campos: `id`, `name`, `description`, `icon`

### Relaciones
- `provider_categories`: Relación muchos a muchos entre proveedores y categorías
- `provider_application_categories`: Relación entre aplicaciones y categorías
- `provider_reviews`: Reseñas de clientes a proveedores

## 🔐 Autenticación y Autorización

### Roles de Usuario
- **customer**: Usuario cliente (por defecto)
- **provider**: Proveedor de servicios
- **admin**: Administrador del sistema

### RLS (Row Level Security)
- Políticas implementadas para proteger datos sensibles
- Usuarios solo pueden acceder a sus propios datos
- Administradores tienen acceso completo

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd domify
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con las credenciales de Supabase
   ```

4. **Configurar base de datos**
   ```bash
   # Ejecutar el archivo bd.sql en Supabase
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 📝 Uso de Endpoints de Debug

### Crear Aplicación de Prueba
```bash
curl -X POST http://localhost:5173/api/debug/create-test-application
```

### Verificar Estado del Sistema
```bash
curl http://localhost:5173/api/debug/check-status
```

### Migrar Aplicaciones Aprobadas
```bash
curl -X POST http://localhost:5173/api/debug/migrate-approved-applications
```

## 🔧 Desarrollo

### Estructura de Código
- **TypeScript**: Tipado estático para mejor desarrollo
- **SvelteKit**: Framework moderno para aplicaciones web
- **Supabase**: Backend-as-a-Service con PostgreSQL

### Buenas Prácticas
- Uso de tipos TypeScript para todas las interfaces
- Manejo de errores consistente con `ExceptionHandler`
- Documentación Swagger para endpoints de debug
- Separación clara entre endpoints de producción y debug

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. 
# Auth0 Integration Complete - Fri Aug  1 13:09:32 CST 2025
