import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler, ValidationException } from '$lib/exceptions';
import { googleSheetsService } from '$lib/google-sheets';
import { sendBulkImportNotificationEmail } from '$lib/email-service';

interface BulkImportResult {
	success: number;
	failed: number;
	errors: Array<{
		row: number;
		email: string;
		error: string;
	}>;
	details: Array<{
		email: string;
		status: 'created' | 'updated' | 'skipped' | 'error';
		message: string;
	}>;
}

export const POST: RequestHandler = async ({ request, locals: { supabaseAdmin } }) => {
	try {
		const { spreadsheetId, range = 'A:Z', skipFirstRow = true, dryRun = false } = await request.json();

		if (!spreadsheetId) {
			throw new ValidationException('ID del Google Sheets es requerido');
		}

		console.log('🚀 Iniciando importación masiva de proveedores...');
		console.log('📊 Spreadsheet ID:', spreadsheetId);
		console.log('🔍 Rango:', range);
		console.log('⏭️ Saltar primera fila:', skipFirstRow);
		console.log('🧪 Modo prueba:', dryRun);

		// 1. Obtener datos del Google Sheets
		const applications = await googleSheetsService.getApplicationsFromSheet(spreadsheetId, range);
		
		if (!applications || applications.length === 0) {
			throw new ValidationException('No se encontraron datos en el Google Sheets');
		}

		console.log(`📋 Encontradas ${applications.length} filas para procesar`);

		// 2. Procesar cada fila
		const result: BulkImportResult = {
			success: 0,
			failed: 0,
			errors: [],
			details: []
		};

		for (let i = 0; i < applications.length; i++) {
			const row = applications[i];
			const rowNumber = skipFirstRow ? i + 2 : i + 1; // +2 porque i empieza en 0 y saltamos la primera fila

			try {
				// Validar datos mínimos requeridos
				if (!row.email || !row.firstName || !row.lastName || !row.phone) {
					result.failed++;
					result.errors.push({
						row: rowNumber,
						email: row.email || 'Sin email',
						error: 'Faltan campos obligatorios (email, nombre, apellido, teléfono)'
					});
					result.details.push({
						email: row.email || 'Sin email',
						status: 'error',
						message: 'Faltan campos obligatorios'
					});
					continue;
				}

				// Verificar si el usuario ya existe
				const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers({
					filter: `email.eq.${row.email}`
				});

				if (existingUser.users.length > 0) {
					result.details.push({
						email: row.email,
						status: 'skipped',
						message: 'Usuario ya existe'
					});
					continue;
				}

				// Si es modo prueba, solo simular
				if (dryRun) {
					result.success++;
					result.details.push({
						email: row.email,
						status: 'created',
						message: 'Simulado - Usuario sería creado'
					});
					continue;
				}

				// 3. Crear usuario proveedor
				const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
					email: row.email,
					password: generateTemporaryPassword(),
					email_confirm: true,
					user_metadata: {
						role: 'provider',
						name: `${row.firstName} ${row.lastName}`,
						import_source: 'bulk_import',
						import_date: new Date().toISOString()
					}
				});

				if (userError) {
					throw new Error(`Error creando usuario: ${userError.message}`);
				}

				// 4. Crear perfil del proveedor
				const { error: profileError } = await supabaseAdmin
					.from('provider_profiles')
					.insert({
						user_id: user.user.id,
						business_name: row.businessName || `${row.firstName} ${row.lastName}`,
						headline: row.headline || 'Proveedor de Servicios',
						bio: row.bio || 'Proveedor de servicios profesionales',
						phone: row.phone,
						hourly_rate: parseFloat(row.hourlyRate) || 300,
						location: row.department || 'Managua',
						status: 'active',
						experience_years: parseInt(row.experienceYears) || 0,
						availability: row.availability || 'Lunes a Viernes 8AM-6PM',
						provider_type: row.providerType || 'individual'
					});

				if (profileError) {
					throw new Error(`Error creando perfil: ${profileError.message}`);
				}

				// 5. Procesar categorías si existen
				if (row.categories) {
					const categoryNames = row.categories.split(',').map((cat: string) => cat.trim());
					
					// Obtener IDs de categorías
					const { data: categories } = await supabaseAdmin
						.from('categories')
						.select('id, name')
						.in('name', categoryNames);

					if (categories && categories.length > 0) {
						const categoryLinks = categories.map(cat => ({
							provider_id: user.user.id,
							category_id: cat.id
						}));

						await supabaseAdmin
							.from('provider_categories')
							.insert(categoryLinks);
					}
				}

				// 6. Crear aplicación de proveedor (para historial)
				await supabaseAdmin
					.from('provider_applications')
					.insert({
						user_id: user.user.id,
						headline: row.headline || 'Proveedor Importado',
						bio: row.bio || 'Proveedor importado masivamente',
						hourly_rate: parseFloat(row.hourlyRate) || 300,
						location: row.department || 'Managua',
						phone: row.phone,
						email: row.email,
						status: 'approved',
						application_data: {
							first_name: row.firstName,
							last_name: row.lastName,
							department: row.department || 'Managua',
							address: row.address || '',
							provider_type: row.providerType || 'individual',
							experience_years: parseInt(row.experienceYears) || 0,
							availability: row.availability || 'Lunes a Viernes 8AM-6PM',
							business_name: row.businessName || '',
							portfolio: row.portfolio || '',
							references: row.references || '',
							certifications: row.certifications || '',
							licenses: row.licenses || '',
							import_source: 'bulk_import'
						},
						admin_notes: 'Importado masivamente desde Google Sheets',
						reviewed_at: new Date().toISOString(),
						reviewed_by: 'bulk_import_system'
					});

				result.success++;
				result.details.push({
					email: row.email,
					status: 'created',
					message: 'Proveedor creado exitosamente'
				});

				console.log(`✅ Proveedor creado: ${row.email}`);

			} catch (error) {
				result.failed++;
				const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
				
				result.errors.push({
					row: rowNumber,
					email: row.email || 'Sin email',
					error: errorMessage
				});

				result.details.push({
					email: row.email || 'Sin email',
					status: 'error',
					message: errorMessage
				});

				console.error(`❌ Error procesando fila ${rowNumber}:`, error);
			}
		}

		// 7. Enviar notificación por email
		if (!dryRun && result.success > 0) {
			try {
				await sendBulkImportNotificationEmail({
					totalProcessed: applications.length,
					successCount: result.success,
					failedCount: result.failed,
					spreadsheetId,
					details: result.details.slice(0, 10) // Solo primeros 10 para el email
				});
			} catch (emailError) {
				console.warn('⚠️ Error enviando email de notificación:', emailError);
			}
		}

		const successResponse = ExceptionHandler.createSuccessResponse(
			result,
			`Importación masiva completada: ${result.success} exitosos, ${result.failed} fallidos`,
			200
		);

		return json(successResponse);

	} catch (error) {
		console.error('💥 Error en importación masiva:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};

function generateTemporaryPassword(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let password = '';
	for (let i = 0; i < 12; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
} 