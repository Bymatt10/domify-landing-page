import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { testMailcowConnection } from '$lib/email-service';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Verificar si es una solicitud de prueba
		const body = await request.json();
		const { action } = body;

		if (action === 'test') {
			console.log('🧪 Iniciando prueba de configuración Mailcow...');
			
			const result = await testMailcowConnection();
			
			if (result) {
				return json({
					success: true,
					message: '✅ Prueba de Mailcow completada exitosamente. Revisa tu correo info@domify.app',
					timestamp: new Date().toISOString()
				});
			} else {
				return json({
					success: false,
					message: '❌ Error en la prueba de Mailcow. Revisa los logs del servidor.',
					timestamp: new Date().toISOString()
				}, { status: 500 });
			}
		}

		return json({
			success: false,
			message: 'Acción no válida. Usa action: "test" para probar Mailcow.',
			timestamp: new Date().toISOString()
		}, { status: 400 });

	} catch (error) {
		console.error('❌ Error en endpoint de prueba Mailcow:', error);
		
		return json({
			success: false,
			message: 'Error interno del servidor',
			error: error instanceof Error ? error.message : 'Error desconocido',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
};

export const GET: RequestHandler = async () => {
	return json({
		message: 'Endpoint de prueba Mailcow',
		usage: 'POST con { "action": "test" } para probar la configuración',
		timestamp: new Date().toISOString()
	});
}; 