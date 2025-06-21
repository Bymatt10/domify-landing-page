import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendContactEmail } from '$lib/email';
import { 
	ExceptionHandler, 
	ValidationException,
	validateRequired,
	validateEmail
} from '$lib/exceptions';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.json();
		
		// Validar los datos requeridos
		validateRequired(formData.nombre, 'Nombre');
		validateRequired(formData.email, 'Email');
		validateRequired(formData.asunto, 'Asunto');
		validateRequired(formData.mensaje, 'Mensaje');
		validateEmail(formData.email);

		// Enviar email usando el helper centralizado
		const emailResult = await sendContactEmail(formData);

		if (!emailResult.success) {
			console.error('Error enviando email de contacto:', emailResult.error);
			const errorResponse = ExceptionHandler.createErrorResponse(
				new ValidationException('Error al enviar el mensaje. Por favor, intenta de nuevo.')
			);
			return json(errorResponse, { status: 500 });
		}

		// Respuesta exitosa
		const successResponse = ExceptionHandler.createSuccessResponse(
			{ messageId: emailResult.messageId },
			'Mensaje enviado correctamente. Te responderemos pronto.',
			201
		);

		return json(successResponse, { status: 201 });

	} catch (error) {
		console.error('Error procesando mensaje de contacto:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode });
	}
}; 