import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals: { supabase, supabaseAdmin } }) => {
	try {
		console.log('🔍 Iniciando debug de become-provider...');

		// 1. Verificar que la tabla existe
		const { data: tableExists, error: tableError } = await supabaseAdmin
			.from('provider_applications')
			.select('count', { count: 'exact', head: true });

		if (tableError) {
			return json({
				error: 'Table check failed',
				details: tableError,
				step: 1
			});
		}

		console.log('✅ Tabla provider_applications existe');

		// 2. Probar inserción simple
		const testData = {
			headline: 'Test Headline',
			bio: 'Test Bio',
			hourly_rate: 100,
			location: 'Managua',
			phone: '12345678',
			email: 'test@example.com',
			application_data: {
				experience_years: 2,
				certifications: [],
				availability: {}
			},
			status: 'submitted'
		};

		const { data: insertResult, error: insertError } = await supabaseAdmin
			.from('provider_applications')
			.insert(testData)
			.select()
			.single();

		if (insertError) {
			return json({
				error: 'Insert failed',
				details: insertError,
				testData,
				step: 2
			});
		}

		console.log('✅ Inserción exitosa:', insertResult);

		// 3. Probar inserción de categorías
		const { data: categoryResult, error: categoryError } = await supabaseAdmin
			.from('provider_application_categories')
			.insert({
				application_id: insertResult.id,
				category_id: 1
			})
			.select();

		if (categoryError) {
			return json({
				error: 'Category insert failed',
				details: categoryError,
				step: 3
			});
		}

		// 4. Limpiar datos de prueba
		await supabaseAdmin
			.from('provider_application_categories')
			.delete()
			.eq('application_id', insertResult.id);

		await supabaseAdmin
			.from('provider_applications')
			.delete()
			.eq('id', insertResult.id);

		return json({
			success: true,
			message: 'Todas las pruebas pasaron correctamente',
			insertedData: insertResult,
			categoryData: categoryResult
		});

	} catch (error) {
		console.error('❌ Error en debug:', error);
		return json({
			error: 'Unexpected error',
			details: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		});
	}
}; 