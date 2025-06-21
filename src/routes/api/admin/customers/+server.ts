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

        let query = locals.supabaseAdmin
            .from('customers')
            .select(`
                id,
                user_id,
                first_name,
                last_name,
                phone_number,
                created_at,
                user:users (
                    email
                )
            `, { count: 'exact' });

        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
        }

        query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            if (error.message.includes("could not find")) {
                 throw new Error("No se pudo encontrar la relación entre 'customers' y 'users'. Por favor, ejecuta el script SQL para crear la llave foránea.");
            }
            throw error;
        }

        return json({
            customers: data || [],
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