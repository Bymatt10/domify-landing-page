import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

export const GET: RequestHandler = async ({ url, locals: { supabaseAdmin } }) => {
	try {
		const emails = url.searchParams.get('emails')?.split(',') || [];
		
		console.log('🔍 Verificando precios de proveedores...');

		const results = [];

		for (const email of emails) {
			try {
				// Buscar el usuario por email
				const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
				
				if (userError) {
					console.error(`❌ Error listando usuarios:`, userError);
					results.push({
						email,
						error: `Error listando usuarios: ${userError.message}`
					});
					continue;
				}

				const user = users?.users?.find(u => u.email === email);
				
				if (!user) {
					console.log(`⏭️ Usuario no encontrado: ${email}`);
					results.push({
						email,
						error: 'Usuario no encontrado'
					});
					continue;
				}

				// Obtener el perfil del proveedor
				const { data: profile, error: profileError } = await supabaseAdmin
					.from('provider_profiles')
					.select('id, business_name, hourly_rate, created_at')
					.eq('user_id', user.id)
					.single();

				if (profileError || !profile) {
					console.error(`❌ Perfil no encontrado para: ${email}`);
					results.push({
						email,
						error: 'Perfil no encontrado'
					});
					continue;
				}

				results.push({
					email,
					user_id: user.id,
					profile_id: profile.id,
					business_name: profile.business_name,
					hourly_rate: profile.hourly_rate,
					created_at: profile.created_at
				});

				console.log(`✅ ${email}: C$${profile.hourly_rate}`);

			} catch (error) {
				console.error(`❌ Error verificando ${email}:`, error);
				results.push({
					email,
					error: error instanceof Error ? error.message : 'Error desconocido'
				});
			}
		}

		return json({
			success: true,
			results
		});

	} catch (error) {
		console.error('💥 Error verificando precios:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};
