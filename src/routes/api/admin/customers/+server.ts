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

// Función helper para obtener usuarios de auth con emails
async function getAuthUsers(userIds: string[]) {
  const url = `${PUBLIC_SUPABASE_URL}/auth/v1/admin/users`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${PRIVATE_SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch auth users');
    return [];
  }

  const data = await response.json();
  const users = data.users || [];
  
  // Filtrar solo los usuarios que necesitamos
  return users.filter((user: any) => userIds.includes(user.id));
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

        console.log('Fetching customers...');

        // Usar query directa simple
        let queryParams = [`limit=${limit}`, `offset=${offset}`, `order=created_at.desc`];
        
        if (search) {
            queryParams.push(`or=(first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_number.ilike.%${search}%)`);
        }

        const queryString = queryParams.join('&');
        const customers = await directSupabaseQuery(`customers?${queryString}`);

        console.log('Customers fetched successfully:', customers.length);

        // Obtener los emails reales de auth.users
        const userIds = customers.map((customer: any) => customer.user_id);
        const authUsers = await getAuthUsers(userIds);

        // Crear un mapa de user_id -> email
        const emailMap = new Map();
        authUsers.forEach((authUser: any) => {
            emailMap.set(authUser.id, authUser.email);
        });

        // Formatear los datos con emails reales
        const formattedCustomers = (customers || []).map((customer: any) => ({
            ...customer,
            user: {
                id: customer.user_id,
                email: emailMap.get(customer.user_id) || 'Email no disponible',
                raw_user_meta_data: {}
            }
        }));

        const total = customers.length;
        const totalPages = Math.ceil(total / limit);

        return json({
            customers: formattedCustomers,
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