import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';
import { authenticateUser } from '$lib/auth-middleware';
import { getPermissionsForRole } from '$lib/roles';

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get current user profile
 *     description: Get the profile information of the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                           format: email
 *                         role:
 *                           type: string
 *                           enum: [customer, provider, admin]
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                     customer:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         phone_number:
 *                           type: string
 *                         address:
 *                           type: string
 *                     provider:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         business_name:
 *                           type: string
 *                         headline:
 *                           type: string
 *                         bio:
 *                           type: string
 *                         hourly_rate:
 *                           type: number
 *                         average_rating:
 *                           type: number
 *                         total_reviews:
 *                           type: integer
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: "User profile retrieved successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - No valid session found
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const GET: RequestHandler = async (event) => {
    try {
        // Use the new authentication middleware
        const user = await authenticateUser(event);
        
        // Calculate permissions based on role
        const permissions = getPermissionsForRole(user.role);

        // Construct response data
        const responseData = {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                created_at: user.customerProfile?.created_at
            },
            customer: user.customerProfile,
            provider: user.providerProfile,
            permissions
        };

        const successResponse = ExceptionHandler.createSuccessResponse(
            responseData,
            'User profile retrieved successfully'
        );

        return json(successResponse);

    } catch (error) {
        console.error('Error in /api/me endpoint:', error);
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 