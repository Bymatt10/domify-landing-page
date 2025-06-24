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

        // Intentar usar la vista completa primero
        let query = locals.supabaseAdmin
            .from('admin_customers_complete')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_number.ilike.%${search}%,user_email.ilike.%${search}%`);
        }

        query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

        const { data: customers, error, count } = await query;

        if (error) {
            console.error('Error fetching customers from view:', error);
            
            // Si la vista no existe, usar fallback
            console.log('Trying fallback to customers table...');
            return await getCustomersFallback(url, locals);
        }

        // Formatear los datos para mantener compatibilidad con el frontend
        const formattedCustomers = (customers || []).map(customer => ({
            ...customer,
            user: {
                id: customer.user_id,
                email: customer.user_email || 'Email no disponible',
                raw_user_meta_data: customer.raw_user_meta_data
            }
        }));

        return json({
            customers: formattedCustomers,
            total: count || 0,
            page,
            limit,
            totalPages: count ? Math.ceil(count / limit) : 0,
        });

    } catch (e) {
        const error = e as Error;
        console.error('Error fetching customers:', error);
        return json({ error: error.message }, { status: 500 });
    }
};

// Función de respaldo que usa la tabla original
async function getCustomersFallback(url: URL, locals: any) {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Consulta simple sin join problemático
    let query = locals.supabaseAdmin
        .from('customers')
        .select(`
            id,
            user_id,
            first_name,
            last_name,
            phone_number,
            address,
            profile_image_url,
            role,
            created_at,
            updated_at
        `, { count: 'exact' });

    if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: customers, error, count } = await query;

    if (error) {
        throw new Error('Error al cargar los clientes: ' + error.message);
    }

    // Obtener datos de usuario por separado
    let customersWithUsers = customers || [];
    
    if (customers && customers.length > 0) {
        try {
            const userIds = customers.map((customer: any) => customer.user_id).filter(Boolean);
            
            if (userIds.length > 0) {
                const { data: users, error: usersError } = await locals.supabaseAdmin
                    .from('auth.users')
                    .select('id, email, raw_user_meta_data')
                    .in('id', userIds);
                
                if (!usersError && users) {
                    const usersMap = new Map(users.map((u: any) => [u.id, u]));
                    customersWithUsers = customers.map((customer: any) => ({
                        ...customer,
                        user: usersMap.get(customer.user_id) || { 
                            id: customer.user_id, 
                            email: 'Email no disponible', 
                            raw_user_meta_data: null 
                        }
                    }));
                } else {
                    customersWithUsers = customers.map((customer: any) => ({
                        ...customer,
                        user: { 
                            id: customer.user_id, 
                            email: 'Email no disponible', 
                            raw_user_meta_data: null 
                        }
                    }));
                }
            }
        } catch (userFetchError) {
            console.warn('Error fetching users:', userFetchError);
            // Continuar sin datos de usuario
            customersWithUsers = customers.map((customer: any) => ({
                ...customer,
                user: { 
                    id: customer.user_id, 
                    email: 'Email no disponible', 
                    raw_user_meta_data: null 
                }
            }));
        }
    }

    return json({
        customers: customersWithUsers,
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
    });
} 