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
 * /api/services:
 *   get:
 *     summary: Get all services
 *     description: Retrieve a list of all services in the marketplace
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: provider_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by provider ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of services to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of services to skip
 *     responses:
 *       200:
 *         description: List of services retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     services:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Service'
 *                     total:
 *                       type: integer
 *                       description: Total number of services
 *                 message:
 *                   type: string
 *                   example: "Services retrieved successfully"
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
        const categoryId = url.searchParams.get('category_id');
        const providerId = url.searchParams.get('provider_id');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = parseInt(url.searchParams.get('offset') || '0');

        let query = locals.supabase
            .from('services')
            .select(`
                *,
                provider_profiles!inner(*),
                categories!inner(*)
            `)
            .is('deleted_at', null);

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        if (providerId) {
            query = query.eq('provider_id', providerId);
        }

        const { data: services, error, count } = await query
            .range(offset, offset + limit - 1);

        if (error) {
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            { services, total: count },
            'Services retrieved successfully'
        );

        return json(successResponse);
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service
 *     description: Create a new service in the marketplace
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - category_id
 *             properties:
 *               title:
 *                 type: string
 *                 description: Service title
 *               description:
 *                 type: string
 *                 description: Service description
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Service price
 *               category_id:
 *                 type: integer
 *                 description: Category ID
 *               location:
 *                 type: string
 *                 description: Service location
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *                 message:
 *                   type: string
 *                   example: "Service created successfully"
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
        // Check for authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new AuthenticationException('No authorization token provided')
            );
            return json(errorResponse, { status: 401 });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Validate token (in a real app, you'd verify the JWT)
        if (!token || token === 'demo-token-12345' || token.includes('demo-token')) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new AuthorizationException('Invalid or expired token')
            );
            return json(errorResponse, { status: 403 });
        }

        const serviceData = await request.json();

        // Validate required fields
        validateRequired(serviceData.title, 'Title');
        validateRequired(serviceData.description, 'Description');
        validateRequired(serviceData.price, 'Price');
        validateRequired(serviceData.category_id, 'Category ID');

        if (serviceData.price < 0) {
            throw new ValidationException('Price must be greater than or equal to 0');
        }

        const { data: service, error } = await locals.supabase
            .from('services')
            .insert({
                ...serviceData,
                provider_id: 'temp-provider-id', // In real app, get from auth
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            service,
            'Service created successfully',
            201
        );

        return json(successResponse, { status: 201 });
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 