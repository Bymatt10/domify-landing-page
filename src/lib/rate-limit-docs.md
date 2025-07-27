# Rate Limiting System - Domify

## Descripción General

El sistema de rate limiting de Domify protege las APIs contra abuso y ataques de fuerza bruta, implementando límites de velocidad basados en IP y configuración específica por ruta.

## Configuraciones Disponibles

### 1. **Auth** (Autenticación)
- **Ventana**: 15 minutos
- **Límite**: 5 intentos
- **Aplicado en**: Login, registro, reset password, cambio de contraseña
- **Propósito**: Prevenir ataques de fuerza bruta

### 2. **API** (APIs Generales)
- **Ventana**: 1 minuto
- **Límite**: 100 requests
- **Aplicado en**: Todas las APIs por defecto
- **Propósito**: Protección general contra spam

### 3. **Search** (Búsquedas)
- **Ventana**: 1 minuto
- **Límite**: 30 búsquedas
- **Aplicado en**: Búsqueda de categorías, proveedores, servicios
- **Propósito**: Prevenir sobrecarga de búsquedas

### 4. **Forms** (Formularios)
- **Ventana**: 5 minutos
- **Límite**: 10 envíos
- **Aplicado en**: Formularios de contacto, aplicaciones de proveedores
- **Propósito**: Prevenir spam en formularios

### 5. **Webhooks** (Webhooks)
- **Ventana**: 1 minuto
- **Límite**: 10 webhooks
- **Aplicado en**: Endpoints de webhooks
- **Propósito**: Control de integraciones externas

## Implementación

### Middleware Global
El rate limiting se aplica automáticamente en `hooks.server.ts` para todas las rutas de API.

### Aplicación Específica
Para endpoints críticos, se aplica rate limiting adicional:

```typescript
import { applyRateLimit } from '$lib/rate-limit-middleware';

export const POST: RequestHandler = async ({ request }) => {
    // Aplicar rate limiting específico
    const rateLimitResult = await applyRateLimit(request, 'auth');
    if (!rateLimitResult.success) {
        return json({
            error: 'Rate limit exceeded',
            message: 'Too many attempts. Please try again later.',
            retryAfter: rateLimitResult.info?.retryAfter
        }, { status: 429 });
    }
    
    // Continuar con la lógica normal...
};
```

## Headers de Respuesta

### Headers de Rate Limit
- `X-RateLimit-Limit`: Límite máximo de requests
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp cuando se resetea el límite
- `Retry-After`: Segundos para reintentar (solo cuando se excede)

### Ejemplo de Respuesta 429
```json
{
    "error": "Rate limit exceeded",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 900,
    "limit": 5,
    "remaining": 0,
    "reset": 1640995200000
}
```

## Detección de IP

El sistema detecta automáticamente la IP real del cliente usando estos headers en orden:
1. `X-Forwarded-For` (Cloudflare, proxies)
2. `CF-Connecting-IP` (Cloudflare)
3. `X-Real-IP` (Nginx, otros proxies)
4. IP directa (fallback)

## Almacenamiento

### Desarrollo
- **Store**: Memoria local (Map)
- **Persistencia**: No (se pierde al reiniciar)
- **Escalabilidad**: Limitada a una instancia

### Producción (Recomendado)
- **Store**: Redis
- **Persistencia**: Sí
- **Escalabilidad**: Múltiples instancias

Para usar Redis en producción:

```typescript
import { initRateLimitStore } from '$lib/rate-limit';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
initRateLimitStore(redis);
```

## Endpoints de Debug

### Verificar Estado de Rate Limits
```
GET /api/debug/rate-limit-status
```

Respuesta:
```json
{
    "success": true,
    "data": {
        "clientIP": "192.168.1.1",
        "timestamp": "2024-01-01T12:00:00.000Z",
        "configurations": {
            "auth": {
                "limit": 5,
                "remaining": 3,
                "reset": 1640995200000,
                "windowMs": 900000,
                "maxRequests": 5,
                "windowMinutes": 15,
                "resetInMinutes": 12
            }
        }
    }
}
```

### Limpiar Rate Limits (Solo Desarrollo)
```
POST /api/debug/clear-rate-limits
Content-Type: application/json

{
    "config": "auth"  // Opcional: limpiar configuración específica
}
```

## Rutas Exentas

Las siguientes rutas no tienen rate limiting:
- `/api/health`
- `/api/status`
- `/sitemap.xml`
- `/robots.txt`

## Configuración Personalizada

Para crear una configuración personalizada:

```typescript
import { rateLimit } from '$lib/rate-limit';

const customConfig = {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 50,
    keyGenerator: (request: Request) => `custom:${getClientIP(request)}`
};

const result = await rateLimit(request, customConfig);
```

## Monitoreo y Logs

### Logs Automáticos
- Rate limits excedidos
- Errores de almacenamiento
- IPs bloqueadas

### Métricas Recomendadas
- Requests por minuto por IP
- Rate limits excedidos por ruta
- Distribución de IPs

## Seguridad

### Protecciones Implementadas
- Rate limiting por IP
- Configuraciones específicas por ruta
- Headers de seguridad
- Logs de auditoría

### Consideraciones
- Rate limiting puede ser evadido con proxies/VPNs
- Considerar rate limiting por usuario autenticado
- Implementar CAPTCHA para formularios críticos
- Monitorear patrones de abuso

## Troubleshooting

### Problemas Comunes

1. **Rate limits muy estrictos**
   - Ajustar `maxRequests` en la configuración
   - Aumentar `windowMs` para ventanas más largas

2. **Falsos positivos**
   - Verificar detección de IP
   - Revisar configuración de proxies

3. **Performance**
   - Usar Redis en producción
   - Optimizar queries de almacenamiento

### Debug
```bash
# Verificar estado de rate limits
curl https://domify.app/api/debug/rate-limit-status

# Limpiar rate limits (desarrollo)
curl -X POST https://domify.app/api/debug/clear-rate-limits \
  -H "Content-Type: application/json" \
  -d '{"config": "auth"}'
``` 