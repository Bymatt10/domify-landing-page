import { json, type RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException,
    validateRequired,
    validateEmail,
    validatePassword
} from '$lib/exceptions';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { email, password, first_name, last_name, role = 'customer' } = await request.json();

        console.log('📝 Registro simplificado para:', email);

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

        // Create user in Supabase Auth with email confirmation disabled
        const { data: authData, error: authError } = await locals.supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Confirmar email automáticamente
            user_metadata: {
                first_name,
                last_name,
                role: userRole
            }
        });

        if (authError) {
            console.error('Auth signup error:', authError);
            const errorResponse = ExceptionHandler.createErrorResponse(
                new ValidationException(`Error creando usuario: ${authError.message}`)
            );
            return json(errorResponse, { status: 400 });
        }

        if (!authData.user) {
            console.error('No user data returned from auth signup');
            const errorResponse = ExceptionHandler.createErrorResponse(
                new ValidationException('Failed to create user')
            );
            return json(errorResponse, { status: 500 });
        }

        console.log('✅ Usuario creado exitosamente:', authData.user.email);

        const responseUser = {
            id: authData.user.id,
            email: authData.user.email,
            role: userRole
        };

        const successResponse = ExceptionHandler.createSuccessResponse(
            { user: responseUser },
            'Usuario creado exitosamente',
            201
        );

        return json(successResponse, { status: 201 });

    } catch (error) {
        console.error('💥 Error en registro simplificado:', error);
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};
