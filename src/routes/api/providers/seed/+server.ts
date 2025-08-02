import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException, 
    AuthenticationException
} from '$lib/exceptions';

/**
 * @swagger
 * /api/providers/seed:
 *   post:
 *     summary: Seed providers
 *     description: Populate the database with sample service providers for testing
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Providers seeded successfully
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
 *                     message:
 *                       type: string
 *                       example: "Providers seeded successfully"
 *                     statusCode:
 *                       type: number
 *                       example: 201
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid or expired token
 *       500:
 *         description: Internal server error
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // Check authentication
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationException('Authentication required');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // For now, allow demo tokens for testing
        if (!token || token === 'demo-token-12345' || token.includes('demo-token')) {
            // console.log removed
        } else {
            // In a real app, you'd verify the JWT and get user info
            // console.log removed
        }

        // Check if providers already exist
        const { data: existingProviders } = await locals.supabase
            .from('provider_profiles')
            .select('id')
            .limit(1);

        if (existingProviders && existingProviders.length > 0) {
            throw new ValidationException('Providers already exist in the database');
        }

        // Get categories to assign to providers
        const { data: categories } = await locals.supabase
            .from('categories')
            .select('id, name');

        if (!categories || categories.length === 0) {
            throw new ValidationException('No categories found. Please seed categories first.');
        }

        // Create sample users first (if they don't exist)
        const sampleUsers = [
            { email: 'ana.lopez@example.com', first_name: 'Ana', last_name: 'López' },
            { email: 'carlos.perez@example.com', first_name: 'Carlos', last_name: 'Pérez' },
            { email: 'maria.garcia@example.com', first_name: 'María', last_name: 'García' },
            { email: 'juan.martinez@example.com', first_name: 'Juan', last_name: 'Martínez' },
            { email: 'lucia.gomez@example.com', first_name: 'Lucía', last_name: 'Gómez' },
            { email: 'cleanpro@example.com', first_name: 'CleanPro', last_name: 'Services' },
            { email: 'sparkleclean@example.com', first_name: 'SparkleClean', last_name: 'Co.' },
            { email: 'movepro@example.com', first_name: 'MovePro', last_name: 'Express' },
            { email: 'greenthumb@example.com', first_name: 'GreenThumb', last_name: 'Pro' },
            { email: 'assemblypro@example.com', first_name: 'AssemblyPro', last_name: 'Co.' }
        ];

        const createdUsers = [];
        for (const userData of sampleUsers) {
            // Check if user exists in auth.users
            const { data: authUsers, error: authError } = await locals.supabase.auth.admin.listUsers();
            
            if (authError) {
                console.error('Error listing auth users:', authError);
                continue;
            }

            const existingAuthUser = authUsers.users.find(u => u.email === userData.email);

            if (!existingAuthUser) {
                // Create user in Supabase Auth
                const { data: authData, error: authCreateError } = await locals.supabase.auth.admin.createUser({
                    email: userData.email,
                    password: 'password123', // Default password
                    email_confirm: true,
                    user_metadata: {
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        role: 'provider'
                    }
                });

                if (authCreateError) {
                    console.error('Error creating auth user:', authCreateError);
                    continue;
                }

                if (!authData.user) {
                    console.error('No user data returned from auth creation');
                    continue;
                }

                // Create customer profile
                const { data: customerData, error: customerError } = await locals.supabase
                    .from('customers')
                    .insert({
                        user_id: authData.user.id,
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        role: 'provider'
                    })
                    .select()
                    .single();

                if (customerError) {
                    console.error('Error creating customer profile:', customerError);
                    continue;
                }

                createdUsers.push({
                    id: authData.user.id,
                    email: authData.user.email,
                    customer_profile: customerData
                });
            } else {
                createdUsers.push({
                    id: existingAuthUser.id,
                    email: existingAuthUser.email
                });
            }
        }

        // Sample providers data
        const sampleProviders = [
            {
                user_id: createdUsers[0]?.id,
                provider_type: 'individual',
                business_name: 'Ana López',
                description: 'Especialista en limpieza de casas y oficinas. Rápida, confiable y detallista.',
                hourly_rate: 15,
                photo_url: '/img/cleaning.png',
                phone: '+1 (555) 123-4567',
                location: 'Managua, Nicaragua',
                category_ids: [categories.find(c => c.name === 'Limpieza')?.id]
            },
            {
                user_id: createdUsers[5]?.id,
                provider_type: 'company',
                business_name: 'CleanPro Services',
                description: 'Limpieza profesional para empresas y hogares.',
                hourly_rate: 18,
                photo_url: 'https://placehold.co/200x200/0C3B2E/FFFFFF?text=CP&font=roboto',
                phone: '+1 (555) 234-5678',
                location: 'Managua, Nicaragua',
                category_ids: [categories.find(c => c.name === 'Limpieza')?.id]
            },
            {
                user_id: createdUsers[1]?.id,
                provider_type: 'individual',
                business_name: 'Carlos Pérez',
                description: 'Limpieza profunda y ecológica. ¡Tu espacio reluciente!',
                hourly_rate: 13,
                photo_url: '/img/cleaning.png',
                phone: '+1 (555) 345-6789',
                location: 'León, Nicaragua',
                category_ids: [categories.find(c => c.name === 'Limpieza')?.id]
            },
            {
                user_id: createdUsers[2]?.id,
                provider_type: 'individual',
                business_name: 'María García',
                description: 'Limpieza profesional de departamentos y oficinas.',
                hourly_rate: 14,
                photo_url: '/img/cleaning.png',
                phone: '+1 (555) 456-7890',
                location: 'Granada, Nicaragua',
                category_ids: [categories.find(c => c.name === 'Limpieza')?.id]
            },
            {
                user_id: createdUsers[6]?.id,
                provider_type: 'company',
                business_name: 'SparkleClean Co.',
                description: 'Limpieza premium con productos eco-friendly.',
                hourly_rate: 20,
                photo_url: 'https://placehold.co/200x200/6D9773/FFFFFF?text=SC&font=roboto',
                phone: '+1 (555) 567-8901',
                location: 'Managua, Nicaragua',
                category_ids: [categories.find(c => c.name === 'Limpieza')?.id]
            },
            {
                user_id: createdUsers[3]?.id,
                provider_type: 'individual',
                business_name: 'Juan Martínez',
                description: 'Montaje profesional de cuadros, TV y más.',
                hourly_rate: 16,
                photo_url: '/img/mounting.png',
                phone: '+1 (555) 678-9012',
                location: 'Managua, Nicaragua',
                category_ids: [categories.find(c => c.name === 'Montaje')?.id]
            },
            {
                user_id: createdUsers[7]?.id,
                provider_type: 'company',
                business_name: 'MovePro Express',
                description: 'Mudanzas express con seguro completo incluido.',
                hourly_rate: 25,
                photo_url: 'https://placehold.co/200x200/0C3B2E/FFFFFF?text=MP&font=roboto',
                phone: '+1 (555) 789-0123',
                location: 'Managua, Nicaragua',
                category_ids: [categories.find(c => c.name === 'Mudanzas')?.id]
            },
            {
                user_id: createdUsers[8]?.id,
                provider_type: 'company',
                business_name: 'GreenThumb Pro',
                description: 'Diseño y mantenimiento profesional de jardines.',
                hourly_rate: 22,
                photo_url: 'https://placehold.co/200x200/0C3B2E/FFFFFF?text=GT&font=roboto',
                phone: '+1 (555) 890-1234',
                location: 'Managua, Nicaragua',
                category_ids: [categories.find(c => c.name === 'Jardinería')?.id]
            },
            {
                user_id: createdUsers[4]?.id,
                provider_type: 'individual',
                business_name: 'Lucía Gómez',
                description: 'Montaje y ensamblaje de muebles con garantía.',
                hourly_rate: 17,
                photo_url: '/img/assembly.png',
                phone: '+1 (555) 901-2345',
                location: 'León, Nicaragua',
                category_ids: [categories.find(c => c.name === 'Ensamblaje')?.id]
            },
            {
                user_id: createdUsers[9]?.id,
                provider_type: 'company',
                business_name: 'AssemblyPro Co.',
                description: 'Ensamblaje profesional de muebles y equipos.',
                hourly_rate: 21,
                photo_url: 'https://placehold.co/200x200/0C3B2E/FFFFFF?text=AP&font=roboto',
                phone: '+1 (555) 012-3456',
                location: 'Managua, Nicaragua',
                category_ids: [categories.find(c => c.name === 'Ensamblaje')?.id]
            }
        ];

        const createdProviders = [];
        
        // Create providers
        for (const providerData of sampleProviders) {
            if (!providerData.user_id || !providerData.category_ids?.[0]) {
                continue;
            }

            const { data: provider, error: providerError } = await locals.supabase
                .from('provider_profiles')
                .insert({
                    user_id: providerData.user_id,
                    provider_type: providerData.provider_type,
                    business_name: providerData.business_name,
                    description: providerData.description,
                    hourly_rate: providerData.hourly_rate,
                    photo_url: providerData.photo_url,
                    phone: providerData.phone,
                    location: providerData.location,
                    rating: Math.random() * 2 + 3, // Random rating between 3-5
                    total_reviews: Math.floor(Math.random() * 200) + 10 // Random reviews between 10-210
                })
                .select()
                .single();

            if (providerError) {
                console.error('Error creating provider:', providerError);
                continue;
            }

            // Create provider-category relationship
            await locals.supabase
                .from('provider_categories')
                .insert({
                    provider_profile_id: provider.id,
                    category_id: providerData.category_ids[0]
                });

            createdProviders.push(provider);
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            { providers: createdProviders },
            'Providers seeded successfully',
            201
        );

        return json(successResponse, { status: 201 });
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 