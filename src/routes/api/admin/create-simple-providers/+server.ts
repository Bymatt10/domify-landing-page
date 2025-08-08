import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler, ValidationException } from '$lib/exceptions';
import { sendBulkImportNotificationEmail } from '$lib/email-service';

interface SimpleProvider {
	nombre: string;
	telefono: string;
	direccion: string;
	servicios: string;
	email: string;
	horarios: string;
	precio_hora: number;
	experiencia: number;
	tipo: string;
	categorias: string;
}

interface CreateSimpleProviderResult {
	success: number;
	failed: number;
	errors: Array<{
		row: number;
		email: string;
		error: string;
	}>;
	details: Array<{
		email: string;
		status: 'created' | 'skipped' | 'error';
		message: string;
	}>;
}

export const POST: RequestHandler = async ({ request, locals: { supabaseAdmin } }) => {
	try {
		const body = await request.json();
		console.log('📥 Request body:', JSON.stringify(body, null, 2));
		
		const { providers, createAccounts = false } = body;

		if (!providers || !Array.isArray(providers) || providers.length === 0) {
			throw new ValidationException('Se requiere un array de proveedores');
		}

		console.log(`🚀 Creando ${providers.length} proveedores simples...`);
		console.log('📧 Crear cuentas:', createAccounts);

		const result: CreateSimpleProviderResult = {
			success: 0,
			failed: 0,
			errors: [],
			details: []
		};

		for (let i = 0; i < providers.length; i++) {
			const provider = providers[i] as SimpleProvider;
			const rowNumber = i + 1;

			// Generar email automáticamente si está vacío
			let providerEmail = provider.email;
			if (!providerEmail || providerEmail.trim() === '') {
				// Generar email basado en el nombre del negocio
				const businessName = provider.nombre.toLowerCase()
					.replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
					.replace(/\s+/g, '.') // Reemplazar espacios con puntos
					.replace(/\.+/g, '.') // Remover puntos múltiples
					.replace(/^\.|\.$/g, ''); // Remover puntos al inicio y final
				
				providerEmail = `${businessName}@domify.app`;
				console.log(`📧 Email generado automáticamente: ${providerEmail}`);
			}

			try {
				// Validar datos mínimos requeridos
				if (!provider.nombre || !provider.telefono) {
					result.failed++;
					result.errors.push({
						row: rowNumber,
						email: providerEmail,
						error: 'Faltan campos obligatorios (nombre, teléfono)'
					});
					result.details.push({
						email: providerEmail,
						status: 'error',
						message: 'Faltan campos obligatorios'
					});
					continue;
				}

				// Verificar si el usuario ya existe
				console.log(`🔍 Verificando si existe usuario: ${providerEmail}`);
				const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

				if (listError) {
					console.error('❌ Error listando usuarios:', listError);
				}

				// Buscar el usuario específico en la lista completa
				const existingUser = allUsers?.users?.find(user => user.email === providerEmail);
				console.log(`📊 Usuarios totales: ${allUsers?.users?.length || 0}, Usuario encontrado: ${existingUser ? 'SÍ' : 'NO'}`);

				if (existingUser) {
					console.log(`⏭️ Usuario ya existe: ${providerEmail}`);
					result.details.push({
						email: providerEmail,
						status: 'skipped',
						message: 'Usuario ya existe'
					});
					continue;
				}

				console.log(`✅ Usuario no existe, procediendo a crear: ${providerEmail}`);

				let userId: string;

				// Crear usuario si se solicita
				if (createAccounts) {
					const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
						email: providerEmail,
						password: generateTemporaryPassword(),
						email_confirm: true,
						user_metadata: {
							role: 'provider',
							name: provider.nombre,
							import_source: 'simple_import',
							import_date: new Date().toISOString()
						}
					});

					if (userError) {
						throw new Error(`Error creando usuario: ${userError.message}`);
					}

					userId = user.user.id;

					// Crear perfil del proveedor
					const { data: profileData, error: profileError } = await supabaseAdmin
						.from('provider_profiles')
						.insert({
							user_id: userId,
							business_name: provider.nombre,
							headline: provider.servicios,
							bio: provider.servicios,
							phone: provider.telefono,
							hourly_rate: provider.precio_hora,
							location: provider.direccion,
							is_active: true
						})
						.select('id')
						.single();

					if (profileError) {
						throw new Error(`Error creando perfil: ${profileError.message}`);
					}

					const profileId = profileData.id;

					// Procesar categorías
					if (provider.categorias) {
						const categoryNames = provider.categorias.split(',').map((cat: string) => cat.trim());
						
						// Obtener IDs de categorías
						const { data: categories } = await supabaseAdmin
							.from('categories')
							.select('id, name')
							.in('name', categoryNames);

						if (categories && categories.length > 0) {
							const categoryLinks = categories.map(cat => ({
								provider_profile_id: profileId,
								category_id: cat.id
							}));

							const { error: categoryError } = await supabaseAdmin
								.from('provider_categories')
								.insert(categoryLinks);

							if (categoryError) {
								console.error('Error linking categories:', categoryError);
							} else {
								console.log(`✅ Categorías vinculadas para ${providerEmail}:`, categories.map(c => c.name));
							}
						} else {
							console.log(`⚠️ No se encontraron categorías para: ${categoryNames.join(', ')}`);
						}
					}

					// Crear aplicación de proveedor (para historial)
					await supabaseAdmin
						.from('provider_applications')
						.insert({
							user_id: userId,
							headline: provider.servicios,
							bio: provider.servicios,
							hourly_rate: provider.precio_hora,
							location: provider.direccion,
							phone: provider.telefono,
							email: providerEmail,
							status: 'approved',
							application_data: {
								first_name: provider.nombre.split(' ')[0] || provider.nombre,
								last_name: provider.nombre.split(' ').slice(1).join(' ') || '',
								department: 'Managua',
								address: provider.direccion,
								provider_type: provider.tipo.toLowerCase(),
								experience_years: provider.experiencia,
								availability: provider.horarios,
								business_name: provider.nombre,
								import_source: 'simple_import'
							},
							admin_notes: 'Creado desde importación simple',
							reviewed_at: new Date().toISOString(),
							reviewed_by: 'simple_import_system'
						});
				}

				result.success++;
				result.details.push({
					email: providerEmail,
					status: 'created',
					message: createAccounts ? 'Proveedor y cuenta creados exitosamente' : 'Proveedor procesado exitosamente'
				});

				console.log(`✅ Proveedor procesado: ${providerEmail}`);

			} catch (error) {
				const errorEmail = providerEmail || provider.email || 'Sin email';
				result.failed++;
				result.errors.push({
					row: rowNumber,
					email: errorEmail,
					error: error instanceof Error ? error.message : 'Error desconocido'
				});
				result.details.push({
					email: errorEmail,
					status: 'error',
					message: error instanceof Error ? error.message : 'Error desconocido'
				});
				console.error(`❌ Error procesando proveedor ${rowNumber}:`, error);
			}
		}

		// Enviar notificación por email (opcional, no debe fallar la importación)
		if (result.success > 0 || result.failed > 0) {
			try {
				await sendBulkImportNotificationEmail({
					totalProcessed: providers.length,
					successful: result.success,
					failed: result.failed,
					details: result.details,
					importType: 'simple_providers'
				});
				console.log('✅ Email de notificación enviado correctamente');
			} catch (emailError) {
				console.error('❌ Error enviando email de notificación:', emailError);
				console.log('⚠️ La importación se completó pero no se pudo enviar el email de notificación');
			}
		}

		console.log(`✅ Importación completada: ${result.success} exitosos, ${result.failed} fallidos`);

		return json({
			success: true,
			message: `Importación completada: ${result.success} exitosos, ${result.failed} fallidos`,
			result
		});

	} catch (error) {
		console.error('💥 Error en importación simple de proveedores:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};

function generateTemporaryPassword(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
	let password = '';
	for (let i = 0; i < 12; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
} 