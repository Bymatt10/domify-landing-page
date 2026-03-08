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

		// Obtener todos los usuarios una sola vez para verificar duplicados
		const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
		if (listError) {
			console.error('❌ Error listando usuarios:', listError);
		}
		const existingUsersList = allUsers?.users || [];

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

				let userId: string = '';

				// Buscar el usuario específico en la lista cargada
				const existingUser = existingUsersList.find(user => user.email === providerEmail);

				if (existingUser) {
					console.log(`⏭️ Usuario ya existe en Auth: ${providerEmail}. Verificando si tiene perfil...`);
					userId = existingUser.id;
					
					// Verificar si ya tiene perfil
					const { data: existingProfile } = await supabaseAdmin
						.from('provider_profiles')
						.select('id')
						.eq('user_id', userId)
						.maybeSingle();
						
					if (existingProfile) {
						console.log(`✅ El usuario ${providerEmail} ya tiene un perfil. Saltando.`);
						result.details.push({
							email: providerEmail,
							status: 'skipped',
							message: 'Usuario y perfil ya existen'
						});
						continue;
					}
					
					console.log(`📝 El usuario ${providerEmail} existe pero no tiene perfil. Creando perfil...`);
				} else {
					console.log(`✅ Usuario no existe, procediendo a crear cuenta y perfil: ${providerEmail}`);

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
					} else {
						// Si no se crean cuentas y no existe, no podemos crear el perfil
						result.failed++;
						result.errors.push({
							row: rowNumber,
							email: providerEmail,
							error: 'El usuario no existe y createAccounts es false'
						});
						continue;
					}
				}

				// Crear perfil del proveedor
				const { data: profileData, error: profileError } = await supabaseAdmin
					.from('provider_profiles')
					.insert({
						user_id: userId,
						business_name: provider.nombre,
						phone: provider.telefono,
						hourly_rate: provider.precio_hora || 0,
						location: provider.direccion || 'Managua'
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
					const categoryNamesToSearch = [...categoryNames];
					if (categoryNames.some(cn => ['Jardinero', 'Jardineria', 'Jardín'].includes(cn))) {
						categoryNamesToSearch.push('Jardinería');
					}
					if (categoryNames.some(cn => ['Limpieza', 'Limpiador', 'Limpiadora'].includes(cn))) {
						categoryNamesToSearch.push('Limpieza');
					}
					if (categoryNames.some(cn => ['Electricista', 'Electricidad'].includes(cn))) {
						categoryNamesToSearch.push('Electricistas');
					}
					
					const { data: categories } = await supabaseAdmin
						.from('categories')
						.select('id, name')
						.in('name', categoryNamesToSearch);

					let categoryIdsToLink: number[] = [];

					if (categories && categories.length > 0) {
						categoryIdsToLink = categories.map(c => c.id);
					}

					// Si la categoría no existe, intentamos buscarla con ILIKE o creamos una generica?
					// Mejor vamos a crear las categorías faltantes.
					for (const catName of categoryNames) {
						if (!categoryIdsToLink.some(id => categories?.find(c => c.id === id)?.name === catName) && !categoryNamesToSearch.some(c => categories?.find(cat => cat.name === c))) {
							// Crear categoría faltante
							const safeSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
							const { data: newCat, error: newCatErr } = await supabaseAdmin
								.from('categories')
								.insert({
									name: catName,
									slug: safeSlug || 'cat-' + Date.now(),
									icon: 'Briefcase',
									description: `Proveedores de ${catName}`
								})
								.select('id')
								.single();
								
							if (!newCatErr && newCat) {
								categoryIdsToLink.push(newCat.id);
							} else if (newCatErr) {
								console.error('Error insertando categoría:', newCatErr);
							}
						}
					}

					if (categoryIdsToLink.length > 0) {
						const categoryLinks = categoryIdsToLink.map(catId => ({
							provider_profile_id: profileId,
							category_id: catId
						}));

						const { error: categoryError } = await supabaseAdmin
							.from('provider_categories')
							.insert(categoryLinks);

						if (categoryError) {
							console.error('Error linking categories:', categoryError);
						} else {
							console.log(`✅ Categorías vinculadas para ${providerEmail}:`, categoryIdsToLink);
						}
					}
				}

				// Crear aplicación de proveedor (para historial)
				try {
					await supabaseAdmin
						.from('provider_applications')
						.insert({
							user_id: userId,
							headline: provider.servicios,
							bio: provider.servicios,
							hourly_rate: provider.precio_hora || 0,
							location: provider.direccion,
							phone: provider.telefono,
							email: providerEmail,
							status: 'approved',
							application_data: {
								first_name: provider.nombre.split(' ')[0] || provider.nombre,
								last_name: provider.nombre.split(' ').slice(1).join(' ') || '',
								department: 'Managua',
								address: provider.direccion,
								provider_type: (provider.tipo || 'individual').toLowerCase(),
								experience_years: provider.experiencia || 0,
								availability: provider.horarios || 'No especificado',
								business_name: provider.nombre,
								import_source: 'simple_import'
							},
							admin_notes: 'Creado desde importación simple',
							reviewed_at: new Date().toISOString(),
							reviewed_by: 'simple_import_system'
						});
				} catch (appErr) {
					console.warn('⚠️ No se pudo crear el registro en provider_applications:', appErr);
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

		// Enviar notificación por email (opcional, en background para no bloquear)
		if (result.success > 0 || result.failed > 0) {
			try {
				sendBulkImportNotificationEmail({
					totalProcessed: providers.length,
					successCount: result.success,
					failedCount: result.failed,
					spreadsheetId: 'Simple JSON Import',
					details: result.details.slice(0, 50)
				}).catch(emailError => {
					console.error('❌ Error enviando email de notificación (background):', emailError);
				});
			} catch (emailError) {
				console.error('❌ Error al iniciar envío de email:', emailError);
			}
		}

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