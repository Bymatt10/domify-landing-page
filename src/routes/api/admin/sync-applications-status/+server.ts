import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';
import { googleSheetsService } from '$lib/google-sheets';

export const POST: RequestHandler = async ({ request, locals: { supabaseAdmin } }) => {
	try {
		const { applicationId, status, adminNotes } = await request.json();

		if (!applicationId || !status) {
			throw new Error('ID de aplicación y estado son requeridos');
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

		// 2. Actualizar en Google Sheets
		const sheetsUpdated = await googleSheetsService.updateApplicationStatus(
			applicationId, 
			status, 
			adminNotes
		);

		const successResponse = ExceptionHandler.createSuccessResponse(
			{ 
				applicationId, 
				status, 
				databaseUpdated: true,
				sheetsUpdated 
			},
			`Estado de aplicación sincronizado: ${status}`,
			200
		);
		return json(successResponse);

	} catch (error) {
		console.error('💥 Error syncing application status:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
}; 