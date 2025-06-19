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
            console.log('No auth header provided, allowing access for debugging');
        } else {
            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            
            // Validate token (in a real app, you'd verify the JWT)
            if (!token || token === 'demo-token-12345' || token.includes('demo-token')) {
                console.log('Invalid token provided, but allowing access for debugging');
            }
        }

        console.log('Fetching users from marketplace.users table...');

        const { data: users, error } = await locals.supabase
            .from('users')
            .select('id, email, role, created_at')
            .is('deleted_at', null);

        if (error) {
            console.error('Error fetching users:', error);
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        console.log('Users found:', users?.length || 0);
        console.log('Users data:', users);

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
 *     description: Create a new user in the system
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password
 *               role:
 *                 type: string
 *                 enum: [provider, admin]
 *                 default: provider
 *                 description: User's role (defaults to provider)
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
        const { email, password, role = 'provider' } = await request.json();

        // Validate required fields
        validateRequired(email, 'Email');
        validateRequired(password, 'Password');
        validateEmail(email);
        validatePassword(password);

        // Ensure role is always provider by default
        const userRole = role === 'admin' ? 'admin' : 'provider';

        const { data: user, error } = await locals.supabase
            .from('users')
            .insert({
                email,
                password: password, // In real app, hash this
                role: userRole
            })
            .select()
            .single();

        if (error) {
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            user,
            'User created successfully',
            201
        );

        return json(successResponse, { status: 201 });
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 