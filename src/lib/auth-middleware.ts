import type { RequestEvent } from '@sveltejs/kit';
import { ExceptionHandler, AuthenticationException, AuthorizationException } from '$lib/exceptions';
import { canAccessEndpoint, type UserRole } from '$lib/roles';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  customerProfile?: any;
  providerProfile?: any;
}

/**
 * Middleware para autenticar y autorizar usuarios
 */
export async function authenticateUser(event: RequestEvent): Promise<AuthenticatedUser> {
  const { locals } = event;
  
  let userId = null;
  let userEmail = null;
  let userMetadata = null;

  // Try to get session from Supabase first
  const { data: { session: supabaseSession }, error: sessionError } = await locals.supabase.auth.getSession();
  
  if (supabaseSession) {
    userId = supabaseSession.user.id;
    userEmail = supabaseSession.user.email;
    userMetadata = supabaseSession.user.user_metadata;
  } else {
    // If no session, try to get user from Authorization header
    const authHeader = event.request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Verify the JWT token and get user info
        const { data: { user }, error: tokenError } = await locals.supabase.auth.getUser(token);
        
        if (user && !tokenError) {
          userId = user.id;
          userEmail = user.email;
          userMetadata = user.user_metadata;
        }
      } catch (tokenVerifyError) {
        console.error('Token verification error:', tokenVerifyError);
      }
    }
  }

  if (!userId || !userEmail) {
    throw new AuthenticationException('No valid session found');
  }

  // Get user role from auth.users (source of truth for role)
  const userRole = userMetadata?.role || 'customer';
  
  // Get customer profile from database (for profile data, not role)
  const { data: customerData, error: customerError } = await locals.supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (customerError) {
    console.error('Error fetching customer data:', customerError);
    
    // If the error is "no rows found", try to create the profile automatically
    if (customerError.code === 'PGRST116') {
      console.log('No customer profile found, creating one automatically...');
      
      try {
        const { data: newCustomerData, error: createError } = await locals.supabase
          .from('customers')
          .insert({
            user_id: userId,
            first_name: userMetadata?.first_name || 'Usuario',
            last_name: userMetadata?.last_name || 'Nuevo'
          })
          .select('*')
          .single();

        if (createError) {
          console.error('Error creating customer profile:', createError);
          throw new AuthenticationException('Failed to create user profile');
        }

        console.log('Customer profile created successfully:', newCustomerData);
        // Use the newly created profile
        const { data: customerData, error: customerError } = await locals.supabase
          .from('customers')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (customerError) {
          throw new AuthenticationException('User profile not found after creation');
        }
      } catch (createProfileError) {
        console.error('Error in profile creation process:', createProfileError);
        throw new AuthenticationException('User profile not found and could not be created');
      }
    } else {
      throw new AuthenticationException('User profile not found');
    }
  }

  // Get provider profile if exists
  const { data: providerData, error: providerError } = await locals.supabase
    .from('provider_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (providerError && providerError.code !== 'PGRST116') {
    console.error('Error fetching provider data:', providerError);
  }

  return {
    id: userId,
    email: userEmail,
    role: userRole,
    customerProfile: customerData,
    providerProfile: providerData || null
  };
}

/**
 * Middleware para verificar permisos específicos
 */
export async function requirePermissions(event: RequestEvent, requiredPermissions: string[]): Promise<AuthenticatedUser> {
  const user = await authenticateUser(event);
  
  if (!canAccessEndpoint(user.role, requiredPermissions)) {
    throw new AuthorizationException(
      `Insufficient permissions. Required: ${requiredPermissions.join(', ')}. User role: ${user.role}`
    );
  }

  return user;
}

/**
 * Middleware para verificar rol específico
 */
export async function requireRole(event: RequestEvent, requiredRole: UserRole): Promise<AuthenticatedUser> {
  const user = await authenticateUser(event);
  
  if (user.role !== requiredRole) {
    throw new AuthorizationException(
      `Insufficient permissions. Required role: ${requiredRole}. User role: ${user.role}`
    );
  }

  return user;
}

/**
 * Middleware para verificar que el usuario es el propietario del recurso
 */
export async function requireOwnership(event: RequestEvent, resourceUserId: string): Promise<AuthenticatedUser> {
  const user = await authenticateUser(event);
  
  // Admins can access any resource
  if (user.role === 'admin') {
    return user;
  }
  
  // Users can only access their own resources
  if (user.id !== resourceUserId) {
    throw new AuthorizationException('You can only access your own resources');
  }

  return user;
} 