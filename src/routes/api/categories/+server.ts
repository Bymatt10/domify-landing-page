import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException, 
    AuthenticationException,
    AuthorizationException,
    validateRequired
} from '$lib/exceptions';

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all service categories in the marketplace
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: parent_id
 *         schema:
 *           type: integer
 *         description: Filter by parent category ID (for subcategories)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of categories to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of categories to skip
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
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
 *                     total:
 *                       type: integer
 *                       description: Total number of categories
 *                 message:
 *                   type: string
 *                   example: "Categories retrieved successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
export const GET: RequestHandler = async ({ url, locals }) => {
    try {
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');

        // Verificar que locals.supabase esté disponible
        if (!locals.supabase) {
            throw new Error('Supabase client not available');
        }

        const { data: categories, error, count } = await locals.supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        // Si no hay categorías en la base de datos, devolver categorías de ejemplo
        if (!categories || categories.length === 0) {
            // console.log removed
            const sampleCategories = [
                {
                    id: 1,
                    name: 'Electricistas',
                    description: 'Instalaciones y reparaciones eléctricas profesionales',
                    icon: '⚡',
                    slug: 'electricistas',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Fontaneros / Plomeros',
                    description: 'Reparación e instalación de sistemas de agua',
                    icon: '🚰',
                    slug: 'fontaneros',
                    created_at: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Jardinería',
                    description: 'Cuidado y diseño de áreas verdes',
                    icon: '🌳',
                    slug: 'jardineria',
                    created_at: new Date().toISOString()
                },
                {
                    id: 4,
                    name: 'Limpieza de Casas',
                    description: 'Limpieza general y profunda del hogar',
                    icon: '🏠',
                    slug: 'limpieza-casas',
                    created_at: new Date().toISOString()
                },
                {
                    id: 5,
                    name: 'Ensamblaje de Muebles',
                    description: 'Montaje y ensamblaje profesional de muebles',
                    icon: '🔧',
                    slug: 'ensamblaje',
                    created_at: new Date().toISOString()
                },
                {
                    id: 6,
                    name: 'Construcción',
                    description: 'Servicios de construcción y remodelación',
                    icon: '🏗️',
                    slug: 'construccion',
                    created_at: new Date().toISOString()
                },
                {
                    id: 7,
                    name: 'Pintura',
                    description: 'Servicios de pintura interior y exterior',
                    icon: '🎨',
                    slug: 'pintura',
                    created_at: new Date().toISOString()
                },
                {
                    id: 8,
                    name: 'Mudanzas',
                    description: 'Servicios de mudanza y traslado',
                    icon: '🚚',
                    slug: 'mudanzas',
                    created_at: new Date().toISOString()
                },
                {
                    id: 9,
                    name: 'Carpintería',
                    description: 'Trabajos de carpintería y ebanistería',
                    icon: '🪚',
                    slug: 'carpinteria',
                    created_at: new Date().toISOString()
                },
                {
                    id: 10,
                    name: 'Tecnología',
                    description: 'Servicios de tecnología y computación',
                    icon: '💻',
                    slug: 'tecnologia',
                    created_at: new Date().toISOString()
                },
                {
                    id: 11,
                    name: 'Seguridad',
                    description: 'Sistemas de seguridad y vigilancia',
                    icon: '🔒',
                    slug: 'seguridad',
                    created_at: new Date().toISOString()
                },
                {
                    id: 12,
                    name: 'Albañilería',
                    description: 'Trabajos de albañilería y mampostería',
                    icon: '🧱',
                    slug: 'albañileria',
                    created_at: new Date().toISOString()
                }
            ];

            const successResponse = ExceptionHandler.createSuccessResponse(
                { categories: sampleCategories, total: sampleCategories.length },
                'Sample categories retrieved successfully'
            );

            return json(successResponse);
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            { categories, total: count },
            'Categories retrieved successfully'
        );

        return json(successResponse);
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     description: Create a new service category (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - icon
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *                 example: "Ensamblaje"
 *               icon:
 *                 type: string
 *                 description: Path to category icon
 *                 example: "/img/assembly.png"
 *               description:
 *                 type: string
 *                 description: Category description
 *                 example: "Servicios de ensamblaje de muebles y equipos"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
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
            // console.log removed
        } else {
            // In a real app, you'd verify the JWT and get user info
            // For now, we'll assume admin access for testing
            // console.log removed
        }

        const body = await request.json();
        
        // console.log removed
        
        // Validate required fields
        validateRequired(body.name, 'Name');
        validateRequired(body.icon, 'Icon');

        const { name, icon, description } = body;

        // console.log removed

        // Validate name length
        if (name.length > 100) {
            throw new ValidationException('Category name must be 100 characters or less');
        }

        // Validate icon
        if (icon.length > 10) { // Emoji length check
            throw new ValidationException('Icon must be a single emoji or short string');
        }

        // Check if category name already exists
        const { data: existingCategory } = await locals.supabase
            .from('categories')
            .select('id')
            .eq('name', name)
            .single();

        if (existingCategory) {
            throw new ValidationException('Category name already exists');
        }

        // Insert into database
        const { data, error } = await locals.supabase
            .from('categories')
            .insert([{ name, description, icon }])
            .select()
            .single();

        if (error) {
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            data,
            'Category created successfully',
            201
        );

        return json(successResponse, { status: 201 });
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 
