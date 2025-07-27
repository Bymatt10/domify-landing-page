import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException, 
    ConflictException,
    validateRequired,
    validateEmail,
    validatePassword,
    handleAuthError
} from '$lib/exceptions';
import { applyRateLimit } from '$lib/rate-limit-middleware';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     description: Create a new user account
 *     tags: [Authentication]
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
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *                 example: "password123"
 *               first_name:
 *                 type: string
 *                 description: User's first name
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 description: User's last name
 *                 example: "Doe"
 *               role:
 *                 type: string
 *                 enum: [provider, admin]
 *                 default: provider
 *                 description: User's role
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum: [provider, admin]
 *       400:
 *         description: Bad request - validation error
 *       409:
 *         description: Conflict - user already exists
 *       500:
 *         description: Internal server error
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // Aplicar rate limiting específico para registro
        const rateLimitResult = await applyRateLimit(request, 'auth');
        if (!rateLimitResult.success) {
            return json({
                error: 'Rate limit exceeded',
                message: 'Too many registration attempts. Please try again later.',
                retryAfter: rateLimitResult.info?.retryAfter
            }, { 
                status: 429,
                headers: {
                    'Retry-After': rateLimitResult.info?.retryAfter?.toString() || '900'
                }
            });
        }

        const { email, password, first_name, last_name, role = 'provider' } = await request.json();

        console.log('Registration attempt for:', { email, first_name, last_name, role });

        // Validate required fields
        validateRequired(email, 'Email');
        validateRequired(password, 'Password');
        validateRequired(first_name, 'First name');
        validateRequired(last_name, 'Last name');
        validateEmail(email);
        validatePassword(password);

        // Ensure role is valid (customer by default)
        const validRoles = ['customer', 'provider', 'admin'];
        const userRole = validRoles.includes(role) ? role : 'customer';

        console.log('Creating user in Supabase Auth...');

        // Check if we're in development mode
        const isDevelopment = import.meta.env.DEV;
        
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await locals.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name,
                    last_name,
                    role: userRole
                },
                // In development, disable email confirmation
                emailRedirectTo: isDevelopment ? undefined : 'https://domify.app/auth/callback'
            }
        });

        console.log('Auth signup result:', { authData, authError });

        if (authError) {
            console.error('Auth signup error details:', {
                message: authError.message,
                status: authError.status,
                name: authError.name,
                stack: authError.stack
            });
            const errorResponse = handleAuthError(authError);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        if (!authData.user) {
            console.error('No user data returned from auth signup');
            const errorResponse = ExceptionHandler.createErrorResponse(
                new ValidationException('Failed to create user')
            );
            return json(errorResponse, { status: 500 });
        }

        console.log('User created in Auth, ID:', authData.user.id);

        // The customer profile should be created automatically by the trigger
        // We don't need to create it manually anymore
        console.log('Customer profile should be created automatically by trigger');

        const responseUser = {
            id: authData.user.id,
            email: authData.user.email,
            role: userRole
        };

        console.log('Registration successful, returning user:', responseUser);

        const successResponse = ExceptionHandler.createSuccessResponse(
            { user: responseUser },
            'User created successfully',
            201
        );

        return json(successResponse, { status: 201 });

    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 