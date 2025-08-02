import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler, ValidationException, validateRequired } from '$lib/exceptions';
import { googleSheetsService } from '$lib/google-sheets';
import { sendNewApplicationNotificationEmail } from '$lib/email-service';
import { getAdminEmail } from '$lib/env-utils';

export const POST: RequestHandler = async ({ request, locals: { supabase, supabaseAdmin } }) => {
	try {
		const applicationData = await request.json();
		// console.log removed

		// 1. Validar campos requeridos
		validateRequired(applicationData.first_name, 'Nombre');
		validateRequired(applicationData.last_name, 'Apellido');
		validateRequired(applicationData.email, 'Email');
		validateRequired(applicationData.phone, 'Teléfono');
		validateRequired(applicationData.department, 'Departamento');
		validateRequired(applicationData.address, 'Dirección');
		validateRequired(applicationData.provider_type, 'Tipo de proveedor');
		validateRequired(applicationData.headline, 'Título');
		validateRequired(applicationData.bio, 'Descripción');
		validateRequired(applicationData.hourly_rate, 'Precio por hora');
		if (!applicationData.categories || applicationData.categories.length === 0) {
			throw new ValidationException('Debe seleccionar al menos una categoría');
		}

		// console.log removed

		// 2. Preparar datos adicionales para almacenar en application_data
		const additionalData = {
			first_name: applicationData.first_name,
			last_name: applicationData.last_name,
			department: applicationData.department,
			address: applicationData.address,
			provider_type: applicationData.provider_type,
			experience_years: applicationData.experience_years || 0,
			availability: applicationData.availability || {}
		};

		// console.log removed

		// 3. Intentar con supabaseAdmin primero, luego con supabase regular
		let application;
		let applicationError;

		// Intentar con supabaseAdmin
		const { data: adminResult, error: adminError } = await supabaseAdmin
			.from('provider_applications')
			.insert({
				headline: applicationData.headline,
				bio: applicationData.bio,
				hourly_rate: parseFloat(applicationData.hourly_rate),
				location: `${applicationData.department}`, // Mantener compatibilidad
				phone: applicationData.phone,
				email: applicationData.email,
				application_data: additionalData,
				status: 'submitted'
			})
			.select()
			.single();

		if (adminError) {
			// console.log removed
			
			// Intentar con supabase regular
			const { data: regularResult, error: regularError } = await supabase
				.from('provider_applications')
				.insert({
					headline: applicationData.headline,
					bio: applicationData.bio,
					hourly_rate: parseFloat(applicationData.hourly_rate),
					location: `${applicationData.department}`, // Mantener compatibilidad
					phone: applicationData.phone,
					email: applicationData.email,
					application_data: additionalData,
					status: 'submitted'
				})
				.select()
				.single();

			if (regularError) {
				// console.log removed
				throw new Error('No se pudo guardar la aplicación: ' + regularError.message);
			}

			application = regularResult;
			// console.log removed
		} else {
			application = adminResult;
			// console.log removed
		}

		// 4. Vincular categorías
		const categoryLinks = applicationData.categories.map((categoryId: number) => ({
			application_id: application.id,
			category_id: categoryId
		}));

		// console.log removed

		const { error: categoryError } = await supabaseAdmin.from('provider_application_categories').insert(categoryLinks);

		if (categoryError) {
			// console.log removed
			// Intentar con supabase regular
			const { error: categoryErrorRegular } = await supabase.from('provider_application_categories').insert(categoryLinks);
			
			if (categoryErrorRegular) {
				// console.log removed
				throw new Error('No se pudieron guardar las categorías: ' + categoryErrorRegular.message);
			}
			// console.log removed
		} else {
			// console.log removed
		}

		// 5. Obtener nombres de categorías para Google Sheets
		let categoryNames: string[] = [];
		try {
			const { data: categoryData } = await supabaseAdmin
				.from('categories')
				.select('name')
				.in('id', applicationData.categories);

			if (categoryData) {
				categoryNames = categoryData.map(cat => cat.name);
			}
		} catch (error) {
			console.warn('⚠️ Error getting category names:', error);
		}

		// 6. Agregar a Google Sheets (opcional, no bloquea la respuesta)
		try {
			await googleSheetsService.addProviderApplication(application, categoryNames);
		} catch (error) {
			console.warn('⚠️ Error adding to Google Sheets (non-blocking):', error);
		}

		// 7. Enviar email de notificación al admin (opcional, no bloquea la respuesta)
		try {
			const adminEmail = getAdminEmail();
			await sendNewApplicationNotificationEmail(adminEmail, {
				applicationId: application.id,
				providerName: `${applicationData.first_name} ${applicationData.last_name}`,
				providerEmail: application.email,
				providerPhone: application.phone,
				providerType: applicationData.provider_type,
				headline: application.headline,
				hourlyRate: application.hourly_rate,
				categories: categoryNames
			});
		} catch (error) {
			console.warn('⚠️ Error sending notification email (non-blocking):', error);
		}

		const successResponse = ExceptionHandler.createSuccessResponse(
			{ applicationId: application.id },
			'¡Tu aplicación ha sido enviada exitosamente! Te contactaremos pronto.',
			201
		);
		return json(successResponse, { status: 201 });

	} catch (error) {
		console.error('💥 Error completo:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
}; 