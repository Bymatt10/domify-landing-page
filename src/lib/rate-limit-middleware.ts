/**
 * Rate Limiting Middleware para SvelteKit
 * Se integra con hooks.server.ts
 */

import type { Handle } from '@sveltejs/kit';
import { rateLimit, initRateLimitStore, RATE_LIMIT_CONFIGS } from './rate-limit';

// Inicializar store al importar
initRateLimitStore();

// Configuraciones específicas por ruta
const ROUTE_RATE_LIMITS: Record<string, keyof typeof RATE_LIMIT_CONFIGS> = {
  // Rutas de autenticación
  '/api/auth/login': 'auth',
  '/api/auth/register': 'auth',
  '/api/auth/reset-password': 'auth',
  '/api/auth/resend-confirmation': 'auth',
  '/api/auth/change-password': 'auth',
  
  // Rutas de formularios
  '/api/contact': 'forms',
  '/api/become-provider': 'forms',
  '/api/provider-applications': 'forms',
  
  // Rutas de búsqueda
  '/api/categories': 'search',
  '/api/providers': 'search',
  '/api/services': 'search',
  
  // Rutas de debug (más restrictivas)
  '/api/debug': 'api',
  
  // Webhooks
  '/api/webhooks': 'webhooks'
};

// Rutas que requieren rate limiting más estricto
const STRICT_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/reset-password'
];

// Rutas que no requieren rate limiting
const EXEMPT_ROUTES = [
  '/api/health',
  '/api/status',
  '/sitemap.xml',
  '/robots.txt'
];

export const rateLimitHandle: Handle = async ({ event, resolve }) => {
  const { request, url } = event;
  const pathname = url.pathname;
  
  // Saltar rate limiting para rutas exentas
  if (EXEMPT_ROUTES.some(route => pathname.startsWith(route))) {
    return resolve(event);
  }
  
  // Determinar configuración de rate limit
  let rateLimitConfig: keyof typeof RATE_LIMIT_CONFIGS = 'api'; // default
  
  // Buscar configuración específica para la ruta
  for (const [route, config] of Object.entries(ROUTE_RATE_LIMITS)) {
    if (pathname.startsWith(route)) {
      rateLimitConfig = config;
      break;
    }
  }
  
  // Aplicar rate limiting
  const rateLimitResult = await rateLimit(request, rateLimitConfig);
  
  if (!rateLimitResult.success) {
    // Rate limit excedido
    const { info } = rateLimitResult;
    
    // Headers de rate limit
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': info?.limit?.toString() || '0',
      'X-RateLimit-Remaining': info?.remaining?.toString() || '0',
      'X-RateLimit-Reset': info?.reset?.toString() || '0'
    });
    
    if (info?.retryAfter) {
      headers.set('Retry-After', info.retryAfter.toString());
    }
    
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: info?.retryAfter,
        limit: info?.limit,
        remaining: info?.remaining,
        reset: info?.reset
      }),
      {
        status: 429,
        headers
      }
    );
  }
  
  // Agregar headers de rate limit a la respuesta
  const response = await resolve(event);
  
  if (rateLimitResult.info) {
    const { info } = rateLimitResult;
    response.headers.set('X-RateLimit-Limit', info.limit.toString());
    response.headers.set('X-RateLimit-Remaining', info.remaining.toString());
    response.headers.set('X-RateLimit-Reset', info.reset.toString());
  }
  
  return response;
};

// Función helper para aplicar rate limiting en rutas específicas
export function applyRateLimit(
  request: Request,
  config: keyof typeof RATE_LIMIT_CONFIGS = 'api'
): Promise<{ success: boolean; info?: any; error?: string }> {
  return rateLimit(request, config);
}

// Función para verificar si una ruta requiere rate limiting
export function requiresRateLimit(pathname: string): boolean {
  // Rutas exentas
  if (EXEMPT_ROUTES.some(route => pathname.startsWith(route))) {
    return false;
  }
  
  // Rutas de API requieren rate limiting
  if (pathname.startsWith('/api/')) {
    return true;
  }
  
  return false;
}

// Función para obtener configuración de rate limit para una ruta
export function getRateLimitConfig(pathname: string): keyof typeof RATE_LIMIT_CONFIGS {
  for (const [route, config] of Object.entries(ROUTE_RATE_LIMITS)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }
  
  return 'api'; // default
} 