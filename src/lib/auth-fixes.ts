/**
 * Funciones utilitarias para manejar autenticación sin errores
 * Soluciona los problemas comunes de getSession() y .single()
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Obtiene el usuario de forma segura usando getUser() en lugar de getSession()
 * Esto evita el warning de seguridad
 */
export async function safeGetUser(supabase: SupabaseClient) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error.message);
      return { user: null, error };
    }
    
    return { user, error: null };
  } catch (err) {
    console.error('Exception getting user:', err);
    return { user: null, error: err };
  }
}

/**
 * Busca un perfil de usuario de forma segura
 * Usa maybeSingle() para evitar error PGRST116
 */
export async function safeGetUserProfile(supabase: SupabaseClient, userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting user profile:', error.message);
      return { profile: null, error };
    }
    
    return { profile, error: null };
  } catch (err) {
    console.error('Exception getting user profile:', err);
    return { profile: null, error: err };
  }
}

/**
 * Verifica si una tabla existe en la base de datos
 */
export async function tableExists(supabase: SupabaseClient, tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error && 
       (error.message.includes('does not exist') || 
        error.code === '42P01')) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error verificando tabla ${tableName}:`, error);
    return false;
  }
}

/**
 * Crea un perfil de usuario de forma segura con reintentos
 */
export async function safeCreateUserProfile(
  supabase: SupabaseClient, 
  userId: string, 
  userData: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  }
) {
  const maxRetries = 2; // Reduced retries for faster failure
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // console.log removed
      
      const { data: profile, error } = await supabase
        .from('customers')
        .insert({
          user_id: userId,
          first_name: userData.first_name || 'Usuario',
          last_name: userData.last_name || 'Nuevo',
          phone_number: userData.phone_number,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        lastError = error;
        console.error(`Profile creation attempt ${attempt} failed:`, error.message);
        
        // Check if it's a unique constraint violation (user already exists)
        if (error.code === '23505' || error.message.includes('duplicate key')) {
          // console.log removed
          const { data: existingProfile, error: fetchError } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .maybeSingle();
          
          if (existingProfile) {
            // console.log removed
            return { profile: existingProfile, error: null };
          }
          
          if (fetchError) {
            console.error('Error fetching existing profile:', fetchError);
            lastError = fetchError;
          }
        }
        
        // For retryable errors, wait before next attempt  
        if (attempt < maxRetries && isRetryableError(error)) {
          const delay = Math.min(500 * attempt, 1000); // Faster backoff, max 1s
          // console.log removed
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Non-retryable error or max retries reached
        return { profile: null, error };
      }
      
      // console.log removed
      return { profile, error: null };
      
    } catch (err) {
      lastError = err;
      console.error(`Exception on profile creation attempt ${attempt}:`, err);
      
      // For exceptions, only retry if it seems like a temporary issue
      if (attempt < maxRetries && isRetryableException(err)) {
        const delay = Math.min(500 * attempt, 1000);
        // console.log removed
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return { profile: null, error: err };
    }
  }
  
  return { profile: null, error: lastError };
}

/**
 * Determines if a database error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error || !error.message) return false;
  
  const retryableMessages = [
    'connection',
    'timeout',
    'temporary',
    'network',
    'ECONNRESET',
    'ETIMEDOUT',
    'rate limit'
  ];
  
  const message = error.message.toLowerCase();
  return retryableMessages.some(msg => message.includes(msg));
}

/**
 * Determines if an exception is retryable
 */
function isRetryableException(err: any): boolean {
  if (!err) return false;
  
  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    return message.includes('timeout') || 
           message.includes('connection') || 
           message.includes('network') ||
           message.includes('econnreset') ||
           message.includes('etimedout');
  }
  
  return false;
}

/**
 * Obtiene o crea un perfil de usuario con manejo robusto de errores
 */
export async function getOrCreateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  userData?: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  }
) {
  // console.log removed
  
  try {
    // First, try to get existing profile
    const { profile: existingProfile, error: getError } = await safeGetUserProfile(supabase, userId);
    
    if (existingProfile) {
      // console.log removed
      return { profile: existingProfile, created: false, error: null };
    }
    
    // If there's a non-null error getting the profile, handle it
    if (getError) {
      console.error(`Error getting profile for user ${userId}:`, getError);
      
      // For some errors, we might still want to try creating a profile
      if (isRetryableError(getError)) {
        // console.log removed
      } else {
        // For non-retryable errors, return the error
        return { profile: null, created: false, error: getError };
      }
    }
    
    // Try to create new profile
    // console.log removed
    const { profile: newProfile, error: createError } = await safeCreateUserProfile(
      supabase,
      userId,
      userData || {}
    );
    
    if (newProfile) {
      // console.log removed
      return { 
        profile: newProfile, 
        created: true, 
        error: null 
      };
    }
    
    if (createError) {
      console.error(`Failed to create profile for user ${userId}:`, createError);
      
      // As a last resort, try one more time to get existing profile in case
      // it was created by another process (race condition)
      // console.log removed
      const { profile: finalProfile, error: finalError } = await safeGetUserProfile(supabase, userId);
      
      if (finalProfile) {
        // console.log removed
        return { profile: finalProfile, created: false, error: null };
      }
      
      return { 
        profile: null, 
        created: false, 
        error: createError 
      };
    }
    
    // This shouldn't happen, but handle it gracefully
    console.error(`Unexpected state: no profile and no error for user ${userId}`);
    return { 
      profile: null, 
      created: false, 
      error: new Error('Unexpected error: profile creation returned no result') 
    };
    
  } catch (err) {
    console.error(`Exception in getOrCreateUserProfile for user ${userId}:`, err);
    return { 
      profile: null, 
      created: false, 
      error: err 
    };
  }
}

/**
 * Verifica si un usuario tiene un rol específico
 */
export async function checkUserRole(
  supabase: SupabaseClient,
  userId: string,
  requiredRole: 'customer' | 'provider' | 'admin'
) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { hasRole: false, profile: null, error: userError };
    }
    
    const userRole = user.user_metadata?.role || 'customer';
    
    return { 
      hasRole: userRole === requiredRole, 
      profile: null, 
      error: null 
    };
  } catch (err) {
    console.error('Exception checking user role:', err);
    return { hasRole: false, profile: null, error: err };
  }
}
