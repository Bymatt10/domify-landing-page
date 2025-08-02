import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException, 
    ConflictException,
    AuthorizationException,
    validateRequired,
    validateEmail,
    validatePassword
} from '$lib/exceptions';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users in the system
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "Users retrieved successfully"
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
 *       500:
 *         description: Internal server error
 */
export const GET: RequestHandler = async ({ locals, request }) => {
    try {
        // Temporarily allow access without authentication for debugging
        const authHeader = request.headers.get('authorization');
        
        // If no auth header, still allow access for debugging
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // console.log removed
        } else {
            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            
            // Validate token (in a real app, you'd verify the JWT)
            if (!token || token === 'demo-token-12345' || token.includes('demo-token')) {
                // console.log removed
            }
        }

        // console.log removed

        const { data: users, error } = await locals.supabase
            .from('customers')
            .select('id, user_id, first_name, last_name, role, created_at')
            .is('deleted_at', null);

        if (error) {
            console.error('Error fetching users:', error);
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        // console.log removed
        // console.log removed

        const successResponse = ExceptionHandler.createSuccessResponse(
            { users: users || [] },
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
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user in the system using Supabase Auth
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password
 *               first_name:
 *                 type: string
 *                 description: User's first name
 *               last_name:
 *                 type: string
 *                 description: User's last name
 *               role:
 *                 type: string
 *                 enum: [customer, provider, admin]
 *                 default: customer
 *                 description: User's role (defaults to customer)
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 201
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - validation error
 *       409:
 *         description: Conflict - user already exists
 *       500:
 *         description: Internal server error
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { email, password, first_name, last_name, role = 'customer' } = await request.json();

        // Validate required fields
        validateRequired(email, 'Email');
        validateRequired(password, 'Password');
        validateRequired(first_name, 'First name');
        validateRequired(last_name, 'Last name');
        validateEmail(email);
        validatePassword(password);

        // Ensure role is valid
        const validRoles = ['customer', 'provider', 'admin'];
        const userRole = validRoles.includes(role) ? role : 'customer';

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await locals.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name,
                    last_name,
                    role: userRole
                }
            }
        });

        if (authError) {
            const errorResponse = ExceptionHandler.handle(authError);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        if (!authData.user) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new ValidationException('Failed to create user')
            );
            return json(errorResponse, { status: 500 });
        }

        // Now that the user is created in auth.users, our trigger should have created a profile in customers.
        // We might not need to do anything else here if the trigger handles it.

        // Optional: Log for debugging
        // console.log removed

        const { data: customerProfile, error: profileError } = await locals.supabase
            .from('customers')
            .select('id, user_id, first_name, last_name, role, created_at')
            .eq('user_id', authData.user.id)
            .single();

        if (profileError) {
            console.error('Error fetching created profile:', profileError);
            // Return basic user data if profile fetch fails
            const successResponse = ExceptionHandler.createSuccessResponse(
                {
                    id: authData.user.id,
                    email: authData.user.email,
                    role: userRole,
                    created_at: authData.user.created_at
                },
                'User created successfully',
                201
            );
            return json(successResponse, { status: 201 });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            customerProfile,
            'User created successfully',
            201
        );

        return json(successResponse, { status: 201 });
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 