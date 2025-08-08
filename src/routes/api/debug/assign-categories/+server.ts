import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

export const POST: RequestHandler = async ({ request, locals: { supabaseAdmin } }) => {
	try {
		const body = await request.json();
		const { providerEmails, categoryName } = body;

		console.log(`🔗 Asignando categoría "${categoryName}" a proveedores...`);

		// Obtener el ID de la categoría
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

		for (const email of providerEmails) {
			try {
				// Buscar el usuario por email
				const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
				
				if (userError) {
					console.error(`❌ Error listando usuarios:`, userError);
					errors.push(`Error listando usuarios: ${userError.message}`);
					continue;
				}

				const user = users?.users?.find(u => u.email === email);
				
				if (!user) {
					console.log(`⏭️ Usuario no encontrado: ${email}`);
					continue;
				}

				// Obtener el perfil del proveedor
				const { data: profile, error: profileError } = await supabaseAdmin
					.from('provider_profiles')
					.select('id')
					.eq('user_id', user.id)
					.single();

				if (profileError || !profile) {
					console.error(`❌ Perfil no encontrado para: ${email}`);
					errors.push(`Perfil no encontrado para ${email}`);
					continue;
				}

				// Verificar si ya existe la relación
				const { data: existingLink } = await supabaseAdmin
					.from('provider_categories')
					.select('id')
					.eq('provider_profile_id', profile.id)
					.eq('category_id', category.id)
					.single();

				if (existingLink) {
					console.log(`⏭️ Categoría ya asignada para: ${email}`);
					continue;
				}

				// Crear la relación
				const { error: linkError } = await supabaseAdmin
					.from('provider_categories')
					.insert({
						provider_profile_id: profile.id,
						category_id: category.id
					});

				if (linkError) {
					console.error(`❌ Error asignando categoría a ${email}:`, linkError);
					errors.push(`Error asignando categoría a ${email}: ${linkError.message}`);
				} else {
					console.log(`✅ Categoría asignada a: ${email}`);
					assignedCount++;
				}

			} catch (error) {
				console.error(`❌ Error procesando ${email}:`, error);
				errors.push(`Error procesando ${email}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
