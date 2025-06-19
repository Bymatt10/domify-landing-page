import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException, 
    AuthenticationException,
    validateRequired,
    validateEmail,
    handleAuthError
} from '$lib/exceptions';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user with email and password
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 refresh_token:
 *                   type: string
 *                   description: JWT refresh token
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
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { email, password } = await request.json();

        // Validate required fields
        validateRequired(email, 'Email');
        validateRequired(password, 'Password');
        validateEmail(email);

        // Authenticate with Supabase
        const { data, error } = await locals.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            const errorResponse = handleAuthError(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        if (!data.user || !data.session) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new AuthenticationException('Authentication failed')
            );
            return json(errorResponse, { status: 401 });
        }

        // Check if user email is confirmed
        if (!data.user.email_confirmed_at) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new AuthenticationException('Please confirm your email before signing in', { 
                    needsConfirmation: true,
                    email: data.user.email 
                })
            );
            return json(errorResponse, { status: 401 });
        }

        // Get user details from marketplace.users table
        const { data: userData, error: userError } = await locals.supabase
            .from('users')
            .select('id, email, role, created_at')
            .eq('id', data.user.id)
            .single();

        if (userError) {
            console.error('Error fetching user data:', userError);
        }

        const user = userData || {
            id: data.user.id,
            email: data.user.email,
            role: 'provider'
        };

        return json({
            token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user
        }, { status: 200 });

    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 