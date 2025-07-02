import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';

/**
 * Endpoint para verificar el estado actual de los roles de usuario
 */
export const GET: RequestHandler = async ({ locals: { supabase } }) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            return json({ error: 'No hay sesión activa' }, { status: 401 });
        }

        const user = session.user;
        
        // Obtener información del usuario
        const userInfo = {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
            role_from_metadata: user.user_metadata?.role || 'no_role',
            email_confirmed: !!user.email_confirmed_at
        };

        // Verificar si tiene perfil de customer
        const { data: customerProfile, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Verificar si tiene perfil de provider
        const { data: providerProfile, error: providerError } = await supabase
            .from('provider_profiles')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        // Determinar roles y permisos
        const roleFromMetadata = user.user_metadata?.role || 'customer';
        const hasCustomerProfile = !!customerProfile;
        const hasProviderProfile = !!providerProfile;
        
        let effectiveRole = 'customer';
        let isAdmin = false;
        let isProvider = false;

        if (roleFromMetadata === 'admin') {
            effectiveRole = 'admin';
            isAdmin = true;
        } else if (roleFromMetadata === 'provider' || hasProviderProfile) {
            effectiveRole = 'provider';
            isProvider = true;
        } else {
            effectiveRole = 'customer';
        }

        // Verificar acceso a paneles
        const canAccessAdmin = isAdmin;
        const canAccessProvider = isProvider;

        return json({
            user: userInfo,
            profiles: {
                customer: customerProfile,
                provider: providerProfile,
                has_customer_profile: hasCustomerProfile,
                has_provider_profile: hasProviderProfile
            },
            roles: {
                from_metadata: roleFromMetadata,
                effective_role: effectiveRole,
                is_admin: isAdmin,
                is_provider: isProvider
            },
            access: {
                can_access_admin: canAccessAdmin,
                can_access_provider: canAccessProvider
            },
            errors: {
                customer_error: customerError?.message,
                provider_error: providerError?.message
            }
        });

    } catch (error) {
        console.error('Error verificando roles de usuario:', error);
        return json({ 
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}; 