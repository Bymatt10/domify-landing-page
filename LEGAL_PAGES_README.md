# Páginas Legales para Google OAuth - Domify

## Descripción

Se han creado las páginas legales requeridas por Google OAuth para proteger a los usuarios y cumplir con los requisitos de la pantalla de consentimiento.

## Páginas Creadas

### 1. Política de Privacidad (`/privacy`)
- **Ruta**: `src/routes/privacy/+page.svelte`
- **Servidor**: `src/routes/privacy/+page.server.ts`
- **URL**: `https://tudominio.com/privacy`

**Contenido incluido:**
- Información recolectada (personal, uso, servicios)
- Cómo se utiliza la información
- Cuándo se comparte información
- Medidas de seguridad implementadas
- Derechos de privacidad del usuario
- Política de cookies
- Información de contacto
- Fecha de última actualización

### 2. Términos de Servicio (`/terms`)
- **Ruta**: `src/routes/terms/+page.svelte`
- **Servidor**: `src/routes/terms/+page.server.ts`
- **URL**: `https://tudominio.com/terms`

**Contenido incluido:**
- Aceptación de términos
- Descripción de servicios (clientes y proveedores)
- Cuentas de usuario y responsabilidades
- Conducta esperada y prohibida
- Política de pagos y facturación
- Limitaciones de responsabilidad
- Terminación de cuentas
- Propiedad intelectual
- Ley aplicable y jurisdicción
- Modificaciones a los términos
- Información de contacto

## Características Técnicas

### Diseño y UX
- **Estilo consistente** con el resto de la aplicación Domify
- **Navegación rápida** con enlaces internos
- **Diseño responsivo** para móviles y desktop
- **Accesibilidad** con navegación por teclado
- **Scroll suave** entre secciones

### Funcionalidades
- **Navegación por anclas** para secciones específicas
- **Enlaces cruzados** entre páginas legales
- **Información de contacto** integrada
- **Fechas de actualización** visibles
- **Enlaces en el footer** de la aplicación

### Integración
- **Enlaces en el footer** ya existentes
- **SEO optimizado** con meta tags apropiados
- **Estructura de archivos** consistente con SvelteKit
- **Tipado TypeScript** completo

## URLs para Google OAuth

Para configurar Google OAuth, necesitarás proporcionar estas URLs:

1. **Página principal de la aplicación**: `https://tudominio.com`
2. **Vínculo a la Política de Privacidad**: `https://tudominio.com/privacy`
3. **Vínculo a las Condiciones del Servicio**: `https://tudominio.com/terms`

## Personalización Requerida

### Información de Contacto
Actualiza los siguientes elementos con tu información real:

- **Email de privacidad**: `privacy@domify.com`
- **Email legal**: `legal@domify.com`
- **Horarios de atención**: Actualmente configurados como ejemplo
- **Dominio**: Reemplaza `tudominio.com` con tu dominio real

### Contenido Específico
Revisa y ajusta según tu negocio:

- **Comisiones**: Actualmente establecidas en 15% para proveedores
- **Política de reembolsos**: Ajusta según tus políticas reales
- **Jurisdicción legal**: Especifica tu país/jurisdicción
- **Servicios específicos**: Actualiza según los servicios que ofreces

### Fechas
- **Última actualización**: Actualmente establecida en "15 de Diciembre, 2024"
- Actualiza según corresponda

## Cumplimiento Legal

Estas páginas están diseñadas para cumplir con:

- **Google OAuth requirements**
- **GDPR** (Reglamento General de Protección de Datos)
- **LGPD** (Lei Geral de Proteção de Dados - Brasil)
- **CCPA** (California Consumer Privacy Act)
- **Estándares de privacidad** internacionales

## Próximos Pasos

1. **Revisar contenido** con un abogado especializado
2. **Personalizar información** de contacto y políticas específicas
3. **Configurar URLs** en Google OAuth Console
4. **Probar navegación** y funcionalidad
5. **Implementar consentimiento** de cookies si es necesario

## Mantenimiento

- **Revisar periódicamente** las políticas (recomendado cada 6 meses)
- **Actualizar fechas** cuando se modifiquen
- **Notificar cambios** a los usuarios según las políticas establecidas
- **Mantener consistencia** con cambios en el negocio

## Archivos Modificados

- `src/routes/privacy/+page.svelte` (nuevo)
- `src/routes/privacy/+page.server.ts` (nuevo)
- `src/routes/terms/+page.svelte` (nuevo)
- `src/routes/terms/+page.server.ts` (nuevo)
- `src/routes/+layout.svelte` (enlaces ya existían en footer)

## Notas Importantes

- Las páginas están listas para usar inmediatamente
- El contenido es un template que debe ser revisado legalmente
- Los enlaces en el footer ya estaban configurados
- El diseño es consistente con la identidad visual de Domify
- Incluye todas las secciones requeridas por Google OAuth 