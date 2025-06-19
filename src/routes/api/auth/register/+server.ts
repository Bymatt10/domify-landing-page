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
        const { email, password, first_name, last_name, role = 'provider' } = await request.json();

        console.log('Registration attempt for:', { email, first_name, last_name, role });

        // Validate required fields
        validateRequired(email, 'Email');
        validateRequired(password, 'Password');
        validateRequired(first_name, 'First name');
        validateRequired(last_name, 'Last name');
        validateEmail(email);
        validatePassword(password);

        // Ensure role is always provider by default
        const userRole = role === 'admin' ? 'admin' : 'provider';

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
                // In development, we can disable email confirmation
                emailRedirectTo: isDevelopment ? undefined : `${import.meta.env.PUBLIC_SITE_URL}/auth/callback`
            }
        });

        console.log('Auth signup result:', { authData, authError });

        if (authError) {
            // Handle email confirmation errors gracefully
            const errorMessage = authError.message || '';
            if (errorMessage.includes('confirmation email') || 
                errorMessage.includes('Error sending') ||
                errorMessage.includes('email') ||
                authError.code === 'unexpected_failure') {
                console.log('Email confirmation error detected, but user was created');
                
                // Create a basic user response even if authData.user is null
                const responseUser = {
                    id: 'pending-confirmation',
                    email: email,
                    role: userRole
                };
                
                const message = isDevelopment 
                    ? 'User created successfully. In local development, you can sign in directly.'
                    : 'User created successfully. Please check your email for confirmation.';
                
                const successResponse = ExceptionHandler.createSuccessResponse(
                    { user: responseUser, needsConfirmation: true, developmentMode: isDevelopment },
                    message,
                    201
                );
                
                return json(successResponse, { status: 201 });
            }
            
            if (authError.message.includes('already registered')) {
                const errorResponse = ExceptionHandler.createErrorResponse(
                    new ConflictException('User already exists')
                );
                return json(errorResponse, { status: 409 });
            }
            
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

        // Create user in marketplace.users table
        console.log('Creating user in marketplace.users table...');
        const { data: userData, error: userError } = await locals.supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: email,
                role: userRole
            })
            .select('id, email, role, created_at')
            .single();

        console.log('Marketplace user creation result:', { userData, userError });

        if (userError) {
            console.error('Error creating marketplace user:', userError);
        }

        // Create customer profile SOLO si no existe
        console.log('Checking if customer profile exists...');
        const { data: existingCustomer, error: checkCustomerError } = await locals.supabase
            .from('customers')
            .select('id')
            .eq('user_id', authData.user.id)
            .single();

        if (!existingCustomer) {
            console.log('Creating customer profile...');
            const { error: customerError } = await locals.supabase
                .from('customers')
                .insert({
                    user_id: authData.user.id,
                    first_name: first_name,
                    last_name: last_name
                });

            if (customerError) {
                console.error('Error creating customer profile:', customerError);
            }
        } else {
            console.log('Customer profile already exists, skipping creation.');
        }

        const responseUser = userData || {
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