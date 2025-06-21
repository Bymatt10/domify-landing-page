import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler, ValidationException, DatabaseException } from '$lib/exceptions';
import { requirePermissions } from '$lib/auth-middleware';

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve all users in the system. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export const GET: RequestHandler = async (event) => {
    try {
        // Require admin permissions
        const user = await requirePermissions(event, ['read_all_users']);
        
        const { locals } = event;
        
        // Fetch all users from both customers and providers tables
        const { data: customers, error: customersError } = await locals.supabase
            .from('customers')
            .select('id, user_id, first_name, last_name, phone_number, role, created_at, deleted_at');
        // .eq('role', 'customer');

        if (customersError) {
            console.error('Error fetching customers:', customersError);
            const errorResponse = ExceptionHandler.createErrorResponse(
                new DatabaseException('Failed to fetch users')
            );
            return json(errorResponse, { status: 500 });
        }

        // Get all provider profiles
        const { data: providers, error: providersError } = await locals.supabase
            .from('provider_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (providersError) {
            console.error('Error fetching providers:', providersError);
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            {
                customers: customers || [],
                providers: providers || [],
                total: (customers?.length || 0) + (providers?.length || 0)
            },
            'Users retrieved successfully'
        );

        return json(successResponse);

    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user role (Admin only)
 *     description: Update a user's role. Admin access required.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, provider, admin]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
export const PUT: RequestHandler = async (event) => {
    try {
        // Require admin permissions
        const user = await requirePermissions(event, ['update_all_users']);
        
        const { locals, params } = event;
        const { role } = await event.request.json();
        
        if (!role || !['customer', 'provider', 'admin'].includes(role)) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new ValidationException('Invalid role. Must be customer, provider, or admin')
            );
            return json(errorResponse, { status: 400 });
        }

        // Update customer role
        const { data: updatedCustomer, error: updateError } = await locals.supabase
            .from('customers')
            .update({ role })
            .eq('user_id', params.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating user role:', updateError);
            const errorResponse = ExceptionHandler.createErrorResponse(
                new DatabaseException('Failed to update user role')
            );
            return json(errorResponse, { status: 500 });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            updatedCustomer,
            'User role updated successfully'
        );

        return json(successResponse);

    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 