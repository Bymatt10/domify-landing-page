import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

export const POST: RequestHandler = async ({ request, locals: { supabaseAdmin } }) => {
	try {
		const body = await request.json();
		const { updates } = body;

		console.log('💰 Actualizando precios de proveedores...');

		let updatedCount = 0;
		const errors: string[] = [];

		for (const update of updates) {
			try {
				const { email, hourly_rate } = update;

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

				// Actualizar el precio en el perfil del proveedor
				const { error: updateError } = await supabaseAdmin
					.from('provider_profiles')
					.update({ hourly_rate })
					.eq('user_id', user.id);

				if (updateError) {
					console.error(`❌ Error actualizando precio para ${email}:`, updateError);
					errors.push(`Error actualizando precio para ${email}: ${updateError.message}`);
				} else {
					console.log(`✅ Precio actualizado para ${email}: C$${hourly_rate}`);
					updatedCount++;
				}

			} catch (error) {
				console.error(`❌ Error procesando actualización:`, error);
				errors.push(`Error procesando actualización: ${error instanceof Error ? error.message : 'Error desconocido'}`);
			}
		}

		console.log(`✅ Actualización completada: ${updatedCount} proveedores actualizados`);

		return json({
			success: true,
			message: `Actualización completada: ${updatedCount} proveedores actualizados`,
			updatedCount,
			errors: errors.length > 0 ? errors : undefined
		});

	} catch (error) {
		console.error('💥 Error en actualización de precios:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};
