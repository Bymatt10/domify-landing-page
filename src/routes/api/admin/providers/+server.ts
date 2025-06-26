import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PRIVATE_SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// Función helper para hacer queries directas con fetch
async function directSupabaseQuery(endpoint: string, options: any = {}) {
  const url = `${PUBLIC_SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${PRIVATE_SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase query failed:', response.status, response.statusText, errorText);
    throw new Error(`Supabase query failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

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

        console.log('Fetching providers...');

        // Obtener provider_profiles con query directa
        let queryParams = [`limit=${limit}`, `offset=${offset}`, `order=created_at.desc`];
        
        if (search) {
            queryParams.push(`or=(business_name.ilike.%${search}%,phone.ilike.%${search}%)`);
        }

        const queryString = queryParams.join('&');
        const providers = await directSupabaseQuery(`provider_profiles?${queryString}`);

        console.log('Providers fetched successfully:', providers.length);

        // Para cada proveedor, obtener el email desde auth.users
        const providersWithEmail = await Promise.all(providers.map(async (provider: any) => {
            let email = 'Email no disponible';
            
            try {
                // Obtener el usuario desde auth.users usando el user_id
                const authResponse = await fetch(`${PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${provider.user_id}`, {
                    headers: {
                        'Authorization': `Bearer ${PRIVATE_SUPABASE_SERVICE_ROLE_KEY}`,
                        'apikey': PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
                        'Content-Type': 'application/json'
                    }
                });

                if (authResponse.ok) {
                    const authUser = await authResponse.json();
                    email = authUser.email || 'Email no disponible';
                } else {
                    console.warn('Error fetching auth user for provider:', provider.id, authResponse.status);
                }
            } catch (error) {
                console.warn('Error fetching auth user email for provider:', provider.id, error);
            }

            return {
                ...provider,
                user: {
                    email,
                    raw_user_meta_data: {}
                }
            };
        }));

        const total = providers.length;
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