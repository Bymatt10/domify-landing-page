import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler, ValidationException, validateRequired } from '$lib/exceptions';

export const POST: RequestHandler = async ({ request, locals: { supabase, supabaseAdmin } }) => {
	try {
		const applicationData = await request.json();
		console.log('📝 Datos recibidos:', applicationData);

		// 1. Validar campos requeridos
		validateRequired(applicationData.headline, 'Título');
		validateRequired(applicationData.bio, 'Descripción');
		validateRequired(applicationData.hourly_rate, 'Precio por hora');
		validateRequired(applicationData.location, 'Ubicación');
		validateRequired(applicationData.phone, 'Teléfono');
		validateRequired(applicationData.email, 'Email');
		if (!applicationData.categories || applicationData.categories.length === 0) {
			throw new ValidationException('Debe seleccionar al menos una categoría');
		}

		console.log('✅ Validaciones pasadas');

		// 2. Preparar datos adicionales para almacenar en application_data
		const additionalData = {
			experience_years: applicationData.experience_years || 0,
			certifications: applicationData.certifications || [],
			availability: applicationData.availability || {}
		};

		console.log('📊 Datos adicionales preparados:', additionalData);

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
				location: applicationData.location,
				phone: applicationData.phone,
				email: applicationData.email,
				application_data: additionalData,
				status: 'submitted'
			})
			.select()
			.single();

		if (adminError) {
			console.log('❌ Error con supabaseAdmin:', adminError);
			
			// Intentar con supabase regular
			const { data: regularResult, error: regularError } = await supabase
				.from('provider_applications')
				.insert({
					headline: applicationData.headline,
					bio: applicationData.bio,
					hourly_rate: parseFloat(applicationData.hourly_rate),
					location: applicationData.location,
					phone: applicationData.phone,
					email: applicationData.email,
					application_data: additionalData,
					status: 'submitted'
				})
				.select()
				.single();

			if (regularError) {
				console.log('❌ Error con supabase regular:', regularError);
				throw new Error('No se pudo guardar la aplicación: ' + regularError.message);
			}

			application = regularResult;
			console.log('✅ Inserción exitosa con supabase regular');
		} else {
			application = adminResult;
			console.log('✅ Inserción exitosa con supabaseAdmin');
		}

		// 4. Vincular categorías
		const categoryLinks = applicationData.categories.map((categoryId: number) => ({
			application_id: application.id,
			category_id: categoryId
		}));

		console.log('🔗 Vinculando categorías:', categoryLinks);

		const { error: categoryError } = await supabaseAdmin.from('provider_application_categories').insert(categoryLinks);

		if (categoryError) {
			console.log('❌ Error vinculando categorías:', categoryError);
			// Intentar con supabase regular
			const { error: categoryErrorRegular } = await supabase.from('provider_application_categories').insert(categoryLinks);
			
			if (categoryErrorRegular) {
				console.log('❌ Error vinculando categorías con supabase regular:', categoryErrorRegular);
				throw new Error('No se pudieron guardar las categorías: ' + categoryErrorRegular.message);
			}
			console.log('✅ Categorías vinculadas con supabase regular');
		} else {
			console.log('✅ Categorías vinculadas con supabaseAdmin');
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