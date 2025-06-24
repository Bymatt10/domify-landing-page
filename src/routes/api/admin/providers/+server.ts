import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
    try {
        const { session, user } = await locals.safeGetSession();
        if (!session || user?.user_metadata?.role !== 'admin') {
            return json({ error: 'No autorizado' }, { status: 403 });
        }

        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const search = url.searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        // Usar la vista que incluye emails de usuarios
        let query = locals.supabaseAdmin
            .from('admin_providers_view')
            .select(`
                id,
                user_id,
                business_name,
                phone,
                location,
                is_active,
                created_at,
                updated_at,
                user_email
            `, { count: 'exact' });

        if (search) {
            query = query.or(`business_name.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

        const { data: providers, error: providersError, count } = await query;

        if (providersError) {
            console.error('Error fetching providers:', providersError);
            
            // Si la vista no existe, intentamos con la tabla original
            console.log('Trying fallback to provider_profiles table...');
            return await getProvidersFallback(url, locals);
        }

        // Formatear los datos para mantener compatibilidad con el frontend
        const formattedProviders = (providers || []).map((provider: any) => ({
            ...provider,
            user: { 
                email: provider.user_email || 'Email no disponible',
                raw_user_meta_data: null 
            }
        }));

        return json({
            providers: formattedProviders,
            total: count || 0,
            page,
            limit,
            totalPages: count ? Math.ceil(count / limit) : 0,
        });

    } catch (e) {
        const error = e as Error;
        console.error('Error fetching providers:', error);
        return json({ error: error.message }, { status: 500 });
    }
};

// Función de respaldo que usa la tabla original
async function getProvidersFallback(url: URL, locals: any) {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let query = locals.supabaseAdmin
        .from('provider_profiles')
        .select(`
            id,
            user_id,
            business_name,
            phone,
            location,
            is_active,
            created_at,
            updated_at
        `, { count: 'exact' });

    if (search) {
        query = query.or(`business_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: providers, error: providersError, count } = await query;

    if (providersError) {
        throw new Error('Error al cargar los proveedores: ' + providersError.message);
    }

    const providersWithUserData = (providers || []).map((provider: any) => ({
        ...provider,
        user: { 
            email: 'Email no disponible',
            raw_user_meta_data: null 
        }
    }));

    return json({
        providers: providersWithUserData,
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
    });
} 