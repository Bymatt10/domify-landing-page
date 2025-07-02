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
 * Crea un perfil de usuario de forma segura
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
  try {
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
      console.error('Error creating user profile:', error.message);
      return { profile: null, error };
    }
    
    return { profile, error: null };
  } catch (err) {
    console.error('Exception creating user profile:', err);
    return { profile: null, error: err };
  }
}

/**
 * Obtiene o crea un perfil de usuario
 * Función todo-en-uno para casos comunes
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
  // Primero intentar obtener el perfil existente
  const { profile: existingProfile, error: getError } = await safeGetUserProfile(supabase, userId);
  
  if (existingProfile) {
    return { profile: existingProfile, created: false, error: null };
  }
  
  if (getError) {
    return { profile: null, created: false, error: getError };
  }
  
  // Si no existe, crearlo
  const { profile: newProfile, error: createError } = await safeCreateUserProfile(
    supabase,
    userId,
    userData || {}
  );
  
  return { 
    profile: newProfile, 
    created: !!newProfile, 
    error: createError 
  };
}

/**
 * Verifica si un usuario tiene un rol específico
 * Ahora obtiene el rol desde auth.users en lugar de customers
 */
export async function checkUserRole(
  supabase: SupabaseClient,
  userId: string,
  requiredRole: 'customer' | 'provider' | 'admin'
) {
  try {
    // Obtener el rol desde auth.users
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