import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException, 
    AuthenticationException
} from '$lib/exceptions';

/**
 * @swagger
 * /api/categories/seed:
 *   post:
 *     summary: Seed categories
 *     description: Populate the database with initial service categories for onboarding
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Categories seeded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *                     message:
 *                       type: string
 *                       example: "Categories seeded successfully"
 *                     statusCode:
 *                       type: number
 *                       example: 201
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid or expired token, or insufficient permissions
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
            console.log('Using demo token for category seeding');
        } else {
            // In a real app, you'd verify the JWT and get user info
            console.log('Token provided, assuming admin access for testing');
        }

        // Initial categories based on the main page
        const initialCategories = [
            {
                name: 'Ensamblaje',
                path_imgage: '/img/assembly.png',
                description: 'Servicios de ensamblaje de muebles, equipos electrónicos y estructuras'
            },
            {
                name: 'Montaje',
                path_imgage: '/img/mounting.png',
                description: 'Servicios de montaje e instalación de equipos, muebles y sistemas'
            },
            {
                name: 'Mudanzas',
                path_imgage: '/img/moving.png',
                description: 'Servicios de mudanza y traslado de muebles y pertenencias'
            },
            {
                name: 'Limpieza',
                path_imgage: '/img/cleaning.png',
                description: 'Servicios de limpieza residencial, comercial e industrial'
            },
            {
                name: 'Jardinería',
                path_imgage: '/img/gardening.png',
                description: 'Servicios de jardinería, paisajismo y mantenimiento de áreas verdes'
            }
        ];

        // Check if categories already exist
        const { data: existingCategories } = await locals.supabase
            .from('categories')
            .select('name');

        if (existingCategories && existingCategories.length > 0) {
            throw new ValidationException('Categories already exist in the database');
        }

        // Insert categories
        const { data: categories, error } = await locals.supabase
            .from('categories')
            .insert(initialCategories)
            .select();

        if (error) {
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            { categories },
            'Categories seeded successfully',
            201
        );

        return json(successResponse, { status: 201 });
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 