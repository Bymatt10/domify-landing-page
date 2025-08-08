import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

export const DELETE: RequestHandler = async ({ locals: { supabaseAdmin } }) => {
	try {
		console.log('🗑️ Eliminando proveedores de prueba...');

		// Lista de emails de proveedores de prueba a eliminar
		const testEmails = [
			'electricista.test@domify.app',
			'servicios.elctricos.nicaragua@domify.app',
			'electricista.asiel.multiservicios@domify.app',
			'electronic@domify.app',
			'contacto@electricasiel.com',
			'contacto@electronicnic.com'
		];

		let deletedCount = 0;
		const errors: string[] = [];

		for (const email of testEmails) {
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

				console.log(`🗑️ Eliminando usuario: ${email} (ID: ${user.id})`);

				// Eliminar perfil del proveedor
				const { error: profileError } = await supabaseAdmin
					.from('provider_profiles')
					.delete()
					.eq('user_id', user.id);

				if (profileError) {
					console.error(`❌ Error eliminando perfil:`, profileError);
					errors.push(`Error eliminando perfil de ${email}: ${profileError.message}`);
				}

				// Eliminar categorías del proveedor
				const { error: categoryError } = await supabaseAdmin
					.from('provider_categories')
					.delete()
					.eq('provider_profile_id', user.id);

				if (categoryError) {
					console.error(`❌ Error eliminando categorías:`, categoryError);
					errors.push(`Error eliminando categorías de ${email}: ${categoryError.message}`);
				}

				// Eliminar aplicaciones del proveedor
				const { error: applicationError } = await supabaseAdmin
					.from('provider_applications')
					.delete()
					.eq('user_id', user.id);

				if (applicationError) {
					console.error(`❌ Error eliminando aplicaciones:`, applicationError);
					errors.push(`Error eliminando aplicaciones de ${email}: ${applicationError.message}`);
				}

				// Eliminar el usuario de Auth
				const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

				if (deleteUserError) {
					console.error(`❌ Error eliminando usuario:`, deleteUserError);
					errors.push(`Error eliminando usuario ${email}: ${deleteUserError.message}`);
				} else {
					console.log(`✅ Usuario eliminado: ${email}`);
					deletedCount++;
				}

			} catch (error) {
				console.error(`❌ Error procesando ${email}:`, error);
				errors.push(`Error procesando ${email}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
			}
		}

		console.log(`✅ Eliminación completada: ${deletedCount} proveedores eliminados`);

		return json({
			success: true,
			message: `Eliminación completada: ${deletedCount} proveedores eliminados`,
			deletedCount,
			errors: errors.length > 0 ? errors : undefined
		});

	} catch (error) {
		console.error('💥 Error en eliminación de proveedores de prueba:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};
