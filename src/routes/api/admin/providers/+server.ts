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

        // console.log removed

        // Usar el cliente de Supabase admin desde locals
        const { supabaseAdmin } = locals;

        // Primero obtener los perfiles de proveedores
        let query = supabaseAdmin
            .from('provider_profiles')
            .select(`*`, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        // Agregar filtro de búsqueda si existe
        if (search) {
            query = query.or(`business_name.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        const { data: providers, error, count } = await query;

        if (error) {
            console.error('Error fetching providers:', error);
            throw new Error(error.message);
        }

        // Obtener todas las categorías para estos proveedores en una consulta separada
        const providerIds = (providers || []).map(p => p.id);
        let allProviderCategories: any[] = [];
        
        if (providerIds.length > 0) {
            const { data: catData, error: catError } = await supabaseAdmin
                .from('provider_categories')
                .select(`
                    provider_profile_id,
                    category_id,
                    categories (
                        id,
                        name,
                        slug,
                        description,
                        icon
                    )
                `)
                .in('provider_profile_id', providerIds);
            
            if (!catError && catData) {
                allProviderCategories = catData;
            }
        }

        // Formatear los datos combinados
        const providersWithEmail = await Promise.all((providers || []).map(async (provider: any) => {
            // Filtrar las categorías correspondientes a este proveedor
            const relevantCats = allProviderCategories.filter(pc => pc.provider_profile_id === provider.id);
            
            // Reutilizar la lógica de email existente
            let email = 'Email no disponible';
            
            try {
                // Usar el admin client para obtener el usuario
                const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(provider.user_id);

                if (!authError && authUser?.user) {
                    email = authUser.user.email || 'Email no disponible';
                } else {
                    console.warn('Error fetching auth user for provider:', provider.id, authError?.message);
                }
            } catch (error) {
                console.warn('Error fetching auth user email for provider:', provider.id, error);
            }

            // Formatear las categorías
            const categories = (relevantCats || []).map((pc: any) => ({
                id: pc.categories?.id || pc.category_id,
                name: pc.categories?.name || `Categoría ${pc.category_id}`,
                slug: pc.categories?.slug || '',
                description: pc.categories?.description || '',
                icon: pc.categories?.icon || ''
            }));

            return {
                ...provider,
                categories,
                user: {
                    email,
                    raw_user_meta_data: {}
                }
            };
        }));

        const total = count || 0;
        const totalPages = Math.ceil(total / limit);

        return json({
            providers: providersWithEmail,
            total,
            page,
            limit,
            totalPages,
        });

    } catch (e) {
        const error = e as Error;
        console.error('Error fetching providers:', error);
        return json({ error: error.message }, { status: 500 });
    }
}; 