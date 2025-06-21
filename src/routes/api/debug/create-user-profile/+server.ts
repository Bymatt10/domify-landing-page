import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler, ValidationException } from '$lib/exceptions';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { user_id, email, first_name, last_name, role = 'customer' } = await request.json();

        if (!user_id || !email) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new ValidationException('user_id and email are required')
            );
            return json(errorResponse, { status: 400 });
        }

        // Verificar si ya existe un perfil
        const { data: existingProfile, error: checkError } = await locals.supabase
            .from('customers')
            .select('id, user_id, first_name, last_name, role')
            .eq('user_id', user_id)
            .single();

        if (existingProfile) {
            return json({
                message: 'User profile already exists',
                statusCode: 200,
                timestamp: new Date().toISOString(),
                data: existingProfile
            });
        }

        // Crear el perfil de usuario
        const { data: newProfile, error: createError } = await locals.supabase
            .from('customers')
            .insert({
                user_id: user_id,
                first_name: first_name || 'Usuario',
                last_name: last_name || 'Nuevo',
                role: role
            })
            .select('id, user_id, first_name, last_name, role, created_at')
            .single();

        if (createError) {
            console.error('Error creating user profile:', createError);
            const errorResponse = ExceptionHandler.createErrorResponse(
                new ValidationException('Failed to create user profile')
            );
            return json(errorResponse, { status: 500 });
        }

        return json({
            message: 'User profile created successfully',
            statusCode: 201,
            timestamp: new Date().toISOString(),
            data: newProfile
        });
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: 500 });
    }
}; 