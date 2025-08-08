import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

export const POST: RequestHandler = async ({ request, locals: { supabaseAdmin } }) => {
	try {
		const body = await request.json();
		const { providerIds, categoryName } = body;
		console.log(`🔗 Asignando categoría "${categoryName}" a proveedores por ID...`);
		
		const { data: category, error: categoryError } = await supabaseAdmin
			.from('categories')
			.select('id, name')
			.eq('name', categoryName)
			.single();
			
		if (categoryError || !category) {
			throw new Error(`Categoría "${categoryName}" no encontrada`);
		}
		console.log(`📂 Categoría encontrada: ${category.name} (ID: ${category.id})`);
		
		let assignedCount = 0;
		const errors: string[] = [];
		
		for (const providerId of providerIds) {
			try {
				// Verificar que el proveedor existe
				const { data: profile, error: profileError } = await supabaseAdmin
					.from('provider_profiles')
					.select('id, business_name')
					.eq('id', providerId)
					.single();
					
				if (profileError || !profile) {
					console.error(`❌ Perfil no encontrado para ID: ${providerId}`);
					errors.push(`Perfil no encontrado para ID ${providerId}`);
					continue;
				}
				
				// Verificar si ya está asignado
				const { data: existingLink } = await supabaseAdmin
					.from('provider_categories')
					.select('id')
					.eq('provider_profile_id', profile.id)
					.eq('category_id', category.id)
					.single();
					
				if (existingLink) {
					console.log(`⏭️ Categoría ya asignada para: ${profile.business_name}`);
					continue;
				}
				
				// Asignar categoría
				const { error: linkError } = await supabaseAdmin
					.from('provider_categories')
					.insert({
						provider_profile_id: profile.id,
						category_id: category.id
					});
					
				if (linkError) {
					console.error(`❌ Error asignando categoría a ${profile.business_name}:`, linkError);
					errors.push(`Error asignando categoría a ${profile.business_name}: ${linkError.message}`);
				} else {
					console.log(`✅ Categoría asignada a: ${profile.business_name}`);
					assignedCount++;
				}
			} catch (error) {
				console.error(`❌ Error procesando provider ID ${providerId}:`, error);
				errors.push(`Error procesando provider ID ${providerId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
			}
		}
		
		console.log(`✅ Asignación completada: ${assignedCount} proveedores actualizados`);
		return json({
			success: true,
			message: `Asignación completada: ${assignedCount} proveedores actualizados`,
			assignedCount,
			category: category.name,
			errors: errors.length > 0 ? errors : undefined
		});
	} catch (error) {
		console.error('💥 Error en asignación de categorías:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};
