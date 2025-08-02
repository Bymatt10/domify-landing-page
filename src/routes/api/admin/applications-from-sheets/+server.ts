import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';
import { googleSheetsService } from '$lib/google-sheets';

export const GET: RequestHandler = async () => {
	try {
		const applications = await googleSheetsService.getApplicationsFromSheet();
		
		const successResponse = ExceptionHandler.createSuccessResponse(
			{ applications },
			`Se obtuvieron ${applications.length} solicitudes desde Google Sheets`,
			200
		);
		return json(successResponse);

	} catch (error) {
		console.error('💥 Error getting applications from sheets:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
}; 