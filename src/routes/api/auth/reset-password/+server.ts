import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler, ValidationException, validateRequired } from '$lib/exceptions';

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
	try {
		const { email } = await request.json();

		// Validar email
		validateRequired(email, 'Email');
		
		// Validar formato de email
		const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
		if (!emailRegex.test(email)) {
			throw new ValidationException('Formato de email inválido');
		}

		console.log('🔄 Iniciando proceso de reset password para:', email);

		// Enviar email de reset password usando Supabase
		const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${process.env.PUBLIC_SITE_URL || 'https://domify.app'}/auth/new-password`
		});

		if (resetError) {
			console.error('❌ Error en reset password:', resetError);
			throw new Error(`Error enviando email de recuperación: ${resetError.message}`);
		}

		console.log('✅ Email de reset password enviado exitosamente a:', email);

		const successResponse = ExceptionHandler.createSuccessResponse(
			{ email },
			'Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y carpeta de spam.',
			200
		);
		return json(successResponse);

	} catch (error) {
		console.error('💥 Error en reset password:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
}; 