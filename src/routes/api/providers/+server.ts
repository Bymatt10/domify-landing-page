import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PRIVATE_SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { 
    ExceptionHandler, 
    ValidationException, 
    AuthenticationException,
    AuthorizationException,
    validateRequired
} from '$lib/exceptions';

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

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: Get all providers
 *     description: Retrieve a list of all service providers in the marketplace
 *     tags: [Providers]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: provider_type
 *         schema:
 *           type: string
 *           enum: [individual, company]
 *         description: Filter by provider type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of providers to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of providers to skip
 *     responses:
 *       200:
 *         description: List of providers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     providers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Provider'
 *                     total:
 *                       type: integer
 *                       description: Total number of providers
 *                 message:
 *                   type: string
 *                   example: "Providers retrieved successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
export const GET: RequestHandler = async ({ url }) => {
    try {
        const id = url.searchParams.get('id');
        if (id) {
            // Obtener provider por ID
            const provider = await directSupabaseQuery(`provider_profiles?id=eq.${id}&limit=1`);
            if (!provider || provider.length === 0) throw new Error('Provider not found');
            return json({ data: provider[0], message: 'Provider retrieved', statusCode: 200, timestamp: new Date().toISOString() });
        }
        
        // Listar todos con filtros
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const categoryId = url.searchParams.get('category_id');
        const providerType = url.searchParams.get('provider_type');
        
        console.log('🔍 Fetching providers with filters:', { limit, offset, categoryId, providerType });
        
        // Construir query para provider_profiles
        let queryParams = [
            `is_active=eq.true`,
            `limit=${limit}`,
            `offset=${offset}`
        ];
        
        // Aplicar filtro por tipo de proveedor si se proporciona
        if (providerType && providerType !== 'all') {
            queryParams.push(`provider_type=eq.${providerType}`);
        }
        
        const queryString = queryParams.join('&');
        const allProviders = await directSupabaseQuery(`provider_profiles?${queryString}`);
        
        console.log(`📊 Found ${allProviders.length} active providers`);
        
        // Si hay filtro por categoría, filtrar por categoría
        let filteredProviders = allProviders;
        if (categoryId) {
            console.log(`🎯 Filtering by category ID: ${categoryId}`);
            
            // Obtener los provider_profile_ids que pertenecen a esta categoría
            const categoryProviders = await directSupabaseQuery(`provider_categories?category_id=eq.${categoryId}&select=provider_profile_id`);
            console.log(`🔗 Found ${categoryProviders.length} providers in category ${categoryId}:`, categoryProviders);
            
            if (categoryProviders && categoryProviders.length > 0) {
                const providerIds = categoryProviders.map((cp: any) => cp.provider_profile_id);
                filteredProviders = allProviders.filter((provider: any) => 
                    providerIds.includes(provider.id)
                );
                console.log(`✅ Filtered to ${filteredProviders.length} providers for category ${categoryId}`);
            } else {
                filteredProviders = [];
                console.log(`❌ No providers found for category ${categoryId}`);
            }
        }
        
        // Para cada proveedor, obtener el email real del auth
        const providersWithEmails = await Promise.all(filteredProviders.map(async (provider: any) => {
            let email = 'user@example.com';
            
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
                    email = authUser.email || 'user@example.com';
                }
            } catch (error) {
                console.warn('Error fetching auth user email for provider:', provider.id);
            }

            return {
                id: provider.id,
                business_name: provider.business_name || provider.headline || 'Sin nombre',
                photo_url: provider.photo_url || '/img/cleaning.png',
                rating: provider.average_rating || 0,
                hourly_rate: provider.hourly_rate || 500,
                description: provider.bio || 'Sin descripción',
                total_reviews: provider.total_reviews || 0,
                provider_type: provider.provider_type || 'individual',
                location: provider.location,
                phone: provider.phone,
                users: {
                    id: provider.user_id,
                    email: email,
                    role: 'provider'
                },
                provider_categories: []
            };
        }));
        
        console.log(`🎉 Returning ${providersWithEmails.length} providers`);
        
        return json({ 
            data: { 
                providers: providersWithEmails,
                total: providersWithEmails.length
            }, 
            message: 'Providers retrieved', 
            statusCode: 200, 
            timestamp: new Date().toISOString() 
        });
    } catch (error) {
        console.error('❌ Error in providers endpoint:', error);
        return json({ error: { message: error instanceof Error ? error.message : 'Unknown error', statusCode: 400, timestamp: new Date().toISOString() } }, { status: 400 });
    }
};

/**
 * @swagger
 * /api/providers:
 *   post:
 *     summary: Create a new provider
 *     description: Create a new service provider profile
 *     tags: [Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - provider_type
 *               - business_name
 *               - description
 *               - hourly_rate
 *               - category_ids
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: User ID from auth
 *               provider_type:
 *                 type: string
 *                 enum: [individual, company]
 *                 description: Type of provider
 *               business_name:
 *                 type: string
 *                 description: Business or individual name
 *               description:
 *                 type: string
 *                 description: Provider description
 *               hourly_rate:
 *                 type: number
 *                 minimum: 0
 *                 description: Hourly rate in USD
 *               photo_url:
 *                 type: string
 *                 description: Profile photo URL
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *               location:
 *                 type: string
 *                 description: Service location
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of category IDs the provider specializes in
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Provider created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Provider'
 *                 message:
 *                   type: string
 *                   example: "Provider created successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 201
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid or expired token
 *       500:
 *         description: Internal server error
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const providerData = await request.json();
        if (!providerData.user_id) throw new Error('user_id is required');
        if (!providerData.headline) throw new Error('headline is required');
        if (!providerData.bio) throw new Error('bio is required');
        // Verifica que el usuario exista
        const { data: user, error: userError } = await locals.supabase
            .from('users')
            .select('id')
            .eq('id', providerData.user_id)
            .single();
        if (userError || !user) throw new Error('User not found');
        // Verifica que no exista ya un perfil activo
        const { data: existing } = await locals.supabase
            .from('provider_profiles')
            .select('id')
            .eq('user_id', providerData.user_id)
            .is('deleted_at', null)
            .single();
        if (existing) throw new Error('User is already registered as a provider');
        // Inserta el nuevo perfil
        const { data: provider, error: providerError } = await locals.supabase
            .from('provider_profiles')
            .insert({
                user_id: providerData.user_id,
                headline: providerData.headline,
                bio: providerData.bio,
                is_verified: providerData.is_verified ?? false,
                is_active: providerData.is_active ?? true,
                average_rating: 0,
                total_reviews: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
        if (providerError) throw new Error(providerError.message);
        return json({ data: provider, message: 'Provider created', statusCode: 201, timestamp: new Date().toISOString() }, { status: 201 });
    } catch (error) {
        return json({ error: { message: error instanceof Error ? error.message : 'Unknown error', statusCode: 400, timestamp: new Date().toISOString() } }, { status: 400 });
    }
};

// PUT: Actualizar provider
export const PUT: RequestHandler = async ({ request, url, locals }) => {
    try {
        const id = url.searchParams.get('id');
        if (!id) throw new Error('Provider id is required');
        const updateData = await request.json();
        // Solo permitir actualizar ciertos campos
        const allowed = ['headline', 'bio', 'is_verified', 'is_active'];
        const updateFields: any = {};
        for (const key of allowed) {
            if (key in updateData) updateFields[key] = updateData[key];
        }
        updateFields.updated_at = new Date().toISOString();
        const { data, error } = await locals.supabase
            .from('provider_profiles')
            .update(updateFields)
            .eq('id', id)
            .select()
            .single();
        if (error || !data) throw new Error('Provider not found or update failed');
        return json({ data, message: 'Provider updated', statusCode: 200, timestamp: new Date().toISOString() });
    } catch (error) {
        return json({ error: { message: error instanceof Error ? error.message : 'Unknown error', statusCode: 400, timestamp: new Date().toISOString() } }, { status: 400 });
    }
};

// DELETE: Borrado lógico
export const DELETE: RequestHandler = async ({ url, locals }) => {
    try {
        const id = url.searchParams.get('id');
        if (!id) throw new Error('Provider id is required');
        const { data, error } = await locals.supabase
            .from('provider_profiles')
            .update({ deleted_at: new Date().toISOString(), is_active: false })
            .eq('id', id)
            .select()
            .single();
        if (error || !data) throw new Error('Provider not found or delete failed');
        return json({ data, message: 'Provider deleted', statusCode: 200, timestamp: new Date().toISOString() });
    } catch (error) {
        return json({ error: { message: error instanceof Error ? error.message : 'Unknown error', statusCode: 400, timestamp: new Date().toISOString() } }, { status: 400 });
    }
}; 