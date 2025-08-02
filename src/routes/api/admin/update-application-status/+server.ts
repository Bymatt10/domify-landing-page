import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler, ValidationException, validateRequired } from '$lib/exceptions';
import { googleSheetsService } from '$lib/google-sheets';

export const POST: RequestHandler = async ({ request, locals: { supabaseAdmin } }) => {
	try {
		const { applicationId, status, adminNotes } = await request.json();

		// Validar campos requeridos
		validateRequired(applicationId, 'ID de aplicación');
		validateRequired(status, 'Estado');

		// Validar estado válido
		const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
		if (!validStatuses.includes(status)) {
			throw new ValidationException('Estado inválido');
		}

		// 1. Actualizar en la base de datos
		const { data: application, error: updateError } = await supabaseAdmin
			.from('provider_applications')
			.update({ 
				status,
				admin_notes: adminNotes || null,
				reviewed_at: new Date().toISOString()
			})
			.eq('id', applicationId)
			.select()
			.single();

		if (updateError) {
			throw new Error('Error actualizando aplicación: ' + updateError.message);
		}

		// 2. Si se aprueba, crear el perfil del proveedor
		if (status === 'approved') {
			try {
				// Obtener datos de la aplicación
				const appData = application.application_data;
				
				// Crear usuario proveedor
				const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
					email: application.email,
					password: generateTemporaryPassword(),
					email_confirm: true,
					user_metadata: {
						role: 'provider',
						name: `${appData.first_name} ${appData.last_name}`,
						application_id: applicationId
					}
				});

				if (userError) {
					console.error('❌ Error creating provider user:', userError);
				} else {
					// Crear perfil del proveedor
					const { error: profileError } = await supabaseAdmin
						.from('provider_profiles')
						.insert({
							user_id: user.user.id,
							business_name: `${appData.first_name} ${appData.last_name}`,
							headline: application.headline,
							phone: application.phone,
							status: 'active'
						});

					if (profileError) {
						console.error('❌ Error creating provider profile:', profileError);
					} else {
						console.log('✅ Provider profile created for application:', applicationId);
					}
				}
			} catch (error) {
				console.error('❌ Error in approval process:', error);
			}
		}

		// 3. Actualizar en Google Sheets (opcional, no bloquea)
		try {
			await googleSheetsService.updateApplicationStatus(applicationId, status, adminNotes);
		} catch (error) {
			console.warn('⚠️ Error updating Google Sheets (non-blocking):', error);
		}

		const successResponse = ExceptionHandler.createSuccessResponse(
			{ applicationId, status },
			`Estado de aplicación actualizado a: ${status}`,
			200
		);
		return json(successResponse);

	} catch (error) {
		console.error('💥 Error updating application status:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};

function generateTemporaryPassword(): string {
	// Generar contraseña temporal de 12 caracteres
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let password = '';
	for (let i = 0; i < 12; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
} 