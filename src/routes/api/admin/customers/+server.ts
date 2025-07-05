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

        console.log('Fetching customers...');

        // Usar el cliente de Supabase admin desde locals
        const { supabaseAdmin } = locals;

        // Construir la query base
        let query = supabaseAdmin
            .from('customers')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        // Agregar filtro de búsqueda si existe
        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
        }

        const { data: customers, error, count } = await query;

        if (error) {
            console.error('Error fetching customers:', error);
            throw new Error(error.message);
        }

        console.log('Customers fetched successfully:', customers?.length || 0);

        // Para cada cliente, obtener el email desde auth.users usando el admin client
        const customersWithEmail = await Promise.all((customers || []).map(async (customer: any) => {
            let email = 'Email no disponible';
            
            try {
                // Usar el admin client para obtener el usuario
                const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(customer.user_id);
                
                if (!authError && authUser?.user) {
                    email = authUser.user.email || 'Email no disponible';
                } else {
                    console.warn('Error fetching auth user for customer:', customer.id, authError?.message);
                }
            } catch (error) {
                console.warn('Error fetching auth user email for customer:', customer.id, error);
            }

            return {
            ...customer,
            user: {
                id: customer.user_id,
                    email,
                raw_user_meta_data: {}
            }
            };
        }));

        const total = count || 0;
        const totalPages = Math.ceil(total / limit);

        return json({
            customers: customersWithEmail,
            total,
            page,
            limit,
            totalPages,
        });

    } catch (e) {
        const error = e as Error;
        console.error('Error fetching customers:', error);
        return json({ error: error.message }, { status: 500 });
    }
}; 