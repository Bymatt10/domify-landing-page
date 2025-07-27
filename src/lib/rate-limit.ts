/**
 * Rate Limiting Utilities
 * Implementa rate limiting usando memoria local o Redis
 */

export interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en milisegundos
  maxRequests: number; // Máximo número de requests por ventana
  keyGenerator?: (request: any) => string; // Función para generar clave única
  skipSuccessfulRequests?: boolean; // Saltar requests exitosos
  skipFailedRequests?: boolean; // Saltar requests fallidos
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Timestamp cuando se resetea
  retryAfter?: number; // Segundos para reintentar
}

// Store en memoria (para desarrollo, usar Redis en producción)
class MemoryStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = this.store.get(key);
    if (!data) return null;

    // Si ya pasó el tiempo de reset, limpiar
    if (Date.now() > data.resetTime) {
      this.store.delete(key);
      return null;
    }

    return data;
  }

  async set(key: string, count: number, resetTime: number): Promise<void> {
    this.store.set(key, { count, resetTime });
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const existing = await this.get(key);
    
    if (!existing) {
      await this.set(key, 1, resetTime);
      return { count: 1, resetTime };
    }

    const newCount = existing.count + 1;
    await this.set(key, newCount, existing.resetTime);
    
    return { count: newCount, resetTime: existing.resetTime };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// Store para Redis (recomendado para producción)
class RedisStore {
  private redis: any;

  constructor(redisClient: any) {
    this.redis = redisClient;
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = await this.redis.get(`rate_limit:${key}`);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    if (Date.now() > parsed.resetTime) {
      await this.redis.del(`rate_limit:${key}`);
      return null;
    }
    
    return parsed;
  }

  async set(key: string, count: number, resetTime: number): Promise<void> {
    const data = JSON.stringify({ count, resetTime });
    const ttl = Math.ceil((resetTime - Date.now()) / 1000);
    await this.redis.setex(`rate_limit:${key}`, ttl, data);
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const existing = await this.get(key);
    
    if (!existing) {
      await this.set(key, 1, resetTime);
      return { count: 1, resetTime };
    }

    const newCount = existing.count + 1;
    await this.set(key, newCount, existing.resetTime);
    
    return { count: newCount, resetTime: existing.resetTime };
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(`rate_limit:${key}`);
  }
}

// Configuraciones predefinidas
export const RATE_LIMIT_CONFIGS = {
  // Rate limit estricto para autenticación
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 intentos por 15 minutos
    keyGenerator: (request: any) => `auth:${request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown'}`
  },

  // Rate limit para APIs generales
  api: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100, // 100 requests por minuto
    keyGenerator: (request: any) => `api:${request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown'}`
  },

  // Rate limit para búsquedas
  search: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 30, // 30 búsquedas por minuto
    keyGenerator: (request: any) => `search:${request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown'}`
  },

  // Rate limit para envío de formularios
  forms: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 10, // 10 envíos por 5 minutos
    keyGenerator: (request: any) => `forms:${request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown'}`
  },

  // Rate limit para webhooks
  webhooks: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 10, // 10 webhooks por minuto
    keyGenerator: (request: any) => `webhooks:${request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown'}`
  }
};

// Store global (usar Redis en producción)
let store: MemoryStore | RedisStore;

// Inicializar store
export function initRateLimitStore(redisClient?: any) {
  if (redisClient) {
    store = new RedisStore(redisClient);
  } else {
    store = new MemoryStore();
  }
}

// Función principal de rate limiting
export async function rateLimit(
  request: Request,
  config: RateLimitConfig | keyof typeof RATE_LIMIT_CONFIGS
): Promise<{ success: boolean; info?: RateLimitInfo; error?: string }> {
  
  // Usar configuración predefinida si se pasa una string
  const rateLimitConfig = typeof config === 'string' ? RATE_LIMIT_CONFIGS[config] : config;
  
  // Generar clave única
  const keyGenerator = rateLimitConfig.keyGenerator || 
    ((req: Request) => `default:${req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'}`);
  
  const key = keyGenerator(request);
  
  try {
    // Incrementar contador
    const { count, resetTime } = await store.increment(key, rateLimitConfig.windowMs);
    
    // Verificar si excede el límite
    if (count > rateLimitConfig.maxRequests) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
      
      return {
        success: false,
        error: 'Rate limit exceeded',
        info: {
          limit: rateLimitConfig.maxRequests,
          remaining: 0,
          reset: resetTime,
          retryAfter
        }
      };
    }
    
    // Request permitido
    return {
      success: true,
      info: {
        limit: rateLimitConfig.maxRequests,
        remaining: Math.max(0, rateLimitConfig.maxRequests - count),
        reset: resetTime
      }
    };
    
  } catch (error) {
    console.error('Rate limit error:', error);
    // En caso de error, permitir el request
    return { success: true };
  }
}

// Función helper para obtener IP real
export function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('cf-connecting-ip') ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

// Función para limpiar rate limits (útil para testing)
export async function clearRateLimit(key: string): Promise<void> {
  await store.reset(key);
}

// Función para obtener información de rate limit sin incrementar
export async function getRateLimitInfo(
  request: Request,
  config: RateLimitConfig | keyof typeof RATE_LIMIT_CONFIGS
): Promise<RateLimitInfo | null> {
  
  const rateLimitConfig = typeof config === 'string' ? RATE_LIMIT_CONFIGS[config] : config;
  const keyGenerator = rateLimitConfig.keyGenerator || 
    ((req: Request) => `default:${getClientIP(req)}`);
  
  const key = keyGenerator(request);
  const data = await store.get(key);
  
  if (!data) {
    return {
      limit: rateLimitConfig.maxRequests,
      remaining: rateLimitConfig.maxRequests,
      reset: Date.now() + rateLimitConfig.windowMs
    };
  }
  
  return {
    limit: rateLimitConfig.maxRequests,
    remaining: Math.max(0, rateLimitConfig.maxRequests - data.count),
    reset: data.resetTime
  };
} 