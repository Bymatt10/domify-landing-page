import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException, 
    AuthenticationException,
    AuthorizationException,
    NotFoundException,
    validateRequired
} from '$lib/exceptions';

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User's unique identifier
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "User retrieved successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const GET: RequestHandler = async ({ params, locals, request }) => {
    try {
        const { id } = params;

        // Validate required parameters
        validateRequired(id, 'User ID');

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

        const { data: user, error } = await locals.supabase
            .from('customers')
            .select('id, user_id, first_name, last_name, role, created_at, updated_at')
            .eq('user_id', id)
            .is('deleted_at', null)
            .single();

        if (error || !user) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new NotFoundException('User')
            );
            return json(errorResponse, { status: 404 });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            user,
            'User retrieved successfully'
        );

        return json(successResponse);
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     description: Update a specific user's information
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User's unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: User's first name
 *               last_name:
 *                 type: string
 *                 description: User's last name
 *               role:
 *                 type: string
 *                 enum: [customer, provider, admin]
 *                 description: User's role
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid or expired token
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
    try {
        const { id } = params;
        const updateData = await request.json();

        // Validate required parameters
        validateRequired(id, 'User ID');

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

        // Ensure role is valid if provided
        if (updateData.role) {
            const validRoles = ['customer', 'provider', 'admin'];
            updateData.role = validRoles.includes(updateData.role) ? updateData.role : 'customer';
        }

        const { data: user, error } = await locals.supabase
            .from('customers')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', id)
            .is('deleted_at', null)
            .select()
            .single();

        if (error || !user) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new NotFoundException('User')
            );
            return json(errorResponse, { status: 404 });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            user,
            'User updated successfully'
        );

        return json(successResponse);
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Soft delete a user (mark as deleted)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User's unique identifier
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid or expired token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const DELETE: RequestHandler = async ({ params, locals, request }) => {
    try {
        const { id } = params;

        // Validate required parameters
        validateRequired(id, 'User ID');

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

        const { error } = await locals.supabase
            .from('customers')
            .update({ deleted_at: new Date().toISOString() })
            .eq('user_id', id)
            .is('deleted_at', null);

        if (error) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new NotFoundException('User')
            );
            return json(errorResponse, { status: 404 });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            null,
            'User deleted successfully'
        );

        return json(successResponse);
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 