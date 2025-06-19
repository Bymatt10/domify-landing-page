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
 *                     marketplace:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: array
 *                         error:
 *                           type: string
 *                     customers:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                         error:
 *                           type: string
 *                     auth:
 *                       type: object
 *                       properties:
 *                         users:
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

        // Check marketplace.users table
        const { data: marketplaceUsers, error: marketplaceError } = await locals.supabase
            .from('users')
            .select('*')
            .is('deleted_at', null);

        console.log('Marketplace users:', marketplaceUsers);
        console.log('Marketplace error:', marketplaceError);

        // Check customers table
        const { data: customers, error: customersError } = await locals.supabase
            .from('customers')
            .select('*')
            .is('deleted_at', null);

        console.log('Customers:', customers);
        console.log('Customers error:', customersError);

        // Try to get auth users (this might not work with current permissions)
        const { data: authUsers, error: authError } = await locals.supabase.auth.admin.listUsers();

        const debugData = {
            marketplace: {
                users: marketplaceUsers || [],
                error: marketplaceError?.message
            },
            customers: {
                data: customers || [],
                error: customersError?.message
            },
            auth: {
                users: authUsers?.users || [],
                error: authError?.message
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