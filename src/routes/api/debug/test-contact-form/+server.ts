import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		// Verificar configuración de email
		const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
		const FROM_EMAIL = process.env.FROM_EMAIL;

		return json({
			success: true,
			contact_form: {
				status: 'ready',
				endpoint: '/api/contact',
				method: 'POST',
				required_fields: ['name', 'email', 'subject', 'message'],
				optional_fields: ['user_id']
			},
			email_config: {
				sendgrid_configured: !!SENDGRID_API_KEY,
				from_email: FROM_EMAIL || 'NOT SET',
				contact_email: 'contact@domify.app',
				api_key_prefix: SENDGRID_API_KEY ? SENDGRID_API_KEY.substring(0, 15) + '...' : 'NOT SET'
			},
			features: {
				contact_form: true,
				email_notification: true,
				confirmation_email: true,
				user_authentication: true,
				form_validation: true
			},
			test_data: {
				sample_request: {
					name: 'Juan Pérez',
					email: 'juan@example.com',
					subject: 'Consulta sobre servicios',
					message: 'Hola, me gustaría obtener más información sobre los servicios de limpieza disponibles.',
					user_id: 'optional-user-id'
				}
			},
			instructions: [
				'1. Visita /contact para ver el formulario',
				'2. Completa el formulario con datos válidos',
				'3. El email se enviará a contact@domify.app',
				'4. Se enviará un email de confirmación al usuario',
				'5. Verifica los logs del servidor para debugging'
			],
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('Error in test-contact-form:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}; 