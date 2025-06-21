import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

/**
 * @swagger
 * /api/debug:
 *   get:
 *     summary: Debug endpoint
 *     description: Get debug information about the system state
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Debug information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     customers:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                         error:
 *                           type: string
 *                     providers:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                         error:
 *                           type: string
 *                     applications:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                         error:
 *                           type: string
 *                 message:
 *                   type: string
 *                   example: "Debug information retrieved successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
export const GET: RequestHandler = async ({ locals }) => {
    try {
        console.log('Debug endpoint called - checking database state...');

        // Check customers table
        const { data: customers, error: customersError } = await locals.supabase
            .from('customers')
            .select('*')
            .is('deleted_at', null);

        // Check provider profiles
        const { data: providers, error: providersError } = await locals.supabase
            .from('provider_profiles')
            .select('*')
            .is('deleted_at', null);

        // Check provider applications
        const { data: applications, error: applicationsError } = await locals.supabase
            .from('provider_applications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        const debugData = {
            customers: {
                data: customers || [],
                error: customersError?.message,
                count: customers?.length || 0
            },
            providers: {
                data: providers || [],
                error: providersError?.message,
                count: providers?.length || 0
            },
            applications: {
                data: applications || [],
                error: applicationsError?.message,
                count: applications?.length || 0
            }
        };

        const successResponse = ExceptionHandler.createSuccessResponse(
            debugData,
            'Debug information retrieved successfully'
        );

        return json(successResponse);

    } catch (error) {
        console.error('Debug endpoint error:', error);
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 