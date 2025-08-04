import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler, ValidationException } from '$lib/exceptions';

interface SampleProvider {
	nombre: string;
	telefono: string;
	direccion: string;
	servicios: string[];
	email?: string;
	horarios: string;
	precio_hora: number;
	experiencia: number;
	tipo: 'individual' | 'empresa';
}

export const POST: RequestHandler = async ({ request, locals: { supabaseAdmin } }) => {
	try {
		const { count = 50, createAccounts = false } = await request.json();

		if (count < 1 || count > 200) {
			throw new ValidationException('La cantidad debe estar entre 1 y 200');
		}

		console.log(`🚀 Generando ${count} proveedores de ejemplo...`);

		// Datos de ejemplo basados en información real de Google Maps
		const sampleProviders: SampleProvider[] = [
			{
				nombre: 'TRANSARES -Transporte y extracción de aguas residuales de sumideros, fosa séptica, trampas de grasas y PTAR.',
				telefono: '86358233',
				direccion: 'Colonia Centroamérica, Casa #87, Managua, Nicaragua',
				servicios: ['Transporte y extracción de aguas residuales', 'Sumideros', 'Fosa séptica', 'Trampas de grasas', 'PTAR'],
				email: 'transares387@outlook.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 488,
				experiencia: 6,
				tipo: 'empresa'
			},
			{
				nombre: 'Plomeria Murillo',
				telefono: '57589832',
				direccion: 'Colonia Centroamérica, Casa #84, Managua, Nicaragua',
				servicios: ['Plomería', 'Fontanería', 'Reparaciones de tuberías', 'Instalaciones sanitarias'],
				email: 'plomeria.murillo231@outlook.com',
				horarios: 'Lunes a Sábado 8:00 AM - 2:00 PM',
				precio_hora: 312,
				experiencia: 10,
				tipo: 'individual'
			},
			{
				nombre: 'Servicios Martínez',
				telefono: '88831155',
				direccion: 'Colonia Centroamérica, Managua, Nicaragua',
				servicios: ['Plomería', 'Fontanería Menor', 'Reparaciones rápidas'],
				email: 'plomeriamartinez19@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 300,
				experiencia: 6,
				tipo: 'individual'
			},
			{
				nombre: 'Electricidad Rápida',
				telefono: '88845678',
				direccion: 'Colonia Los Robles, Managua, Nicaragua',
				servicios: ['Instalaciones eléctricas', 'Reparaciones', 'Mantenimiento'],
				email: 'electricidad.rapida@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 400,
				experiencia: 10,
				tipo: 'individual'
			},
			{
				nombre: 'Jardinería Express',
				telefono: '88891234',
				direccion: 'Colonia Las Palmas, Managua, Nicaragua',
				servicios: ['Jardinería', 'Paisajismo', 'Mantenimiento de áreas verdes'],
				email: 'jardineria.express@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 2:00 PM',
				precio_hora: 350,
				experiencia: 7,
				tipo: 'individual'
			},
			{
				nombre: 'Limpieza Profesional',
				telefono: '88856789',
				direccion: 'Colonia Altamira, Managua, Nicaragua',
				servicios: ['Limpieza residencial', 'Limpieza comercial', 'Limpieza post-construcción'],
				email: 'limpieza.profesional@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 280,
				experiencia: 5,
				tipo: 'individual'
			},
			{
				nombre: 'Construcciones Vega',
				telefono: '88834567',
				direccion: 'Colonia Centroamérica, Managua, Nicaragua',
				servicios: ['Construcción', 'Remodelaciones', 'Albañilería'],
				email: 'construcciones.vega@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 500,
				experiencia: 15,
				tipo: 'empresa'
			},
			{
				nombre: 'Carpintería López',
				telefono: '88878901',
				direccion: 'Colonia Los Robles, Managua, Nicaragua',
				servicios: ['Carpintería', 'Muebles a medida', 'Reparaciones'],
				email: 'carpinteria.lopez@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 2:00 PM',
				precio_hora: 380,
				experiencia: 9,
				tipo: 'individual'
			},
			{
				nombre: 'Mudanzas Express',
				telefono: '88823456',
				direccion: 'Colonia Las Palmas, Managua, Nicaragua',
				servicios: ['Mudanzas', 'Transporte de muebles', 'Embalaje'],
				email: 'mudanzas.express@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 450,
				experiencia: 8,
				tipo: 'empresa'
			},
			{
				nombre: 'Cerrajería 24/7',
				telefono: '88889012',
				direccion: 'Colonia Centroamérica, Managua, Nicaragua',
				servicios: ['Cerrajería', 'Apertura de puertas', 'Cambio de cerraduras'],
				email: 'cerrajeria.24h@gmail.com',
				horarios: 'Lunes a Domingo 8:00 AM - 8:00 PM',
				precio_hora: 400,
				experiencia: 11,
				tipo: 'individual'
			}
		];

		// Generar más proveedores variando los datos
		const generatedProviders: SampleProvider[] = [];
		
		for (let i = 0; i < count; i++) {
			const baseProvider = sampleProviders[i % sampleProviders.length];
			const variation = Math.floor(i / sampleProviders.length);
			
			// Crear variaciones del proveedor base
			const provider: SampleProvider = {
				nombre: `${baseProvider.nombre} ${variation > 0 ? `#${variation + 1}` : ''}`,
				telefono: generatePhoneNumber(),
				direccion: generateAddress(),
				servicios: baseProvider.servicios,
				email: generateEmail(baseProvider.nombre.toLowerCase().replace(/\s+/g, '.')),
				horarios: baseProvider.horarios,
				precio_hora: baseProvider.precio_hora + Math.floor(Math.random() * 100) - 50,
				experiencia: baseProvider.experiencia + Math.floor(Math.random() * 5) - 2,
				tipo: baseProvider.tipo
			};

			// Asegurar valores mínimos
			provider.precio_hora = Math.max(250, provider.precio_hora);
			provider.experiencia = Math.max(1, provider.experiencia);

			generatedProviders.push(provider);
		}

		// Si se solicita crear cuentas, hacerlo
		let createdAccounts = 0;
		if (createAccounts) {
			for (const provider of generatedProviders) {
				try {
					// Crear usuario
					const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
						email: provider.email,
						password: generateTemporaryPassword(),
						email_confirm: true,
						user_metadata: {
							role: 'provider',
							name: provider.nombre,
							sample_provider: true
						}
					});

					if (!userError && user.user) {
						// Crear perfil del proveedor
						await supabaseAdmin
							.from('provider_profiles')
							.insert({
								user_id: user.user.id,
								business_name: provider.nombre,
								headline: `${provider.servicios[0]} Profesional`,
								bio: `Especialista en ${provider.servicios.join(', ')}. ${provider.experiencia} años de experiencia.`,
								phone: provider.telefono,
								hourly_rate: provider.precio_hora,
								location: 'Managua',
								status: 'active',
								experience_years: provider.experiencia,
								availability: provider.horarios,
								provider_type: provider.tipo
							});

						// Crear aplicación de proveedor
						await supabaseAdmin
							.from('provider_applications')
							.insert({
								user_id: user.user.id,
								headline: `${provider.servicios[0]} Profesional`,
								bio: `Especialista en ${provider.servicios.join(', ')}. ${provider.experiencia} años de experiencia.`,
								hourly_rate: provider.precio_hora,
								location: 'Managua',
								phone: provider.telefono,
								email: provider.email,
								status: 'approved',
								application_data: {
									first_name: provider.nombre.split(' ')[0],
									last_name: provider.nombre.split(' ').slice(1).join(' '),
									department: 'Managua',
									address: provider.direccion,
									provider_type: provider.tipo,
									experience_years: provider.experiencia,
									availability: provider.horarios,
									business_name: provider.nombre,
									sample_provider: true
								},
								admin_notes: 'Proveedor de ejemplo generado automáticamente',
								reviewed_at: new Date().toISOString(),
								reviewed_by: 'sample_generator'
							});

						createdAccounts++;
					}
				} catch (error) {
					console.error(`Error creando cuenta para ${provider.nombre}:`, error);
				}
			}
		}

		// Preparar respuesta
		const result = {
			totalGenerated: generatedProviders.length,
			accountsCreated: createdAccounts,
			providers: generatedProviders.map(p => ({
				nombre: p.nombre,
				telefono: p.telefono,
				email: p.email,
				direccion: p.direccion,
				servicios: p.servicios,
				horarios: p.horarios,
				precio_hora: p.precio_hora,
				experiencia: p.experiencia,
				tipo: p.tipo
			}))
		};

		const successResponse = ExceptionHandler.createSuccessResponse(
			result,
			`Generados ${generatedProviders.length} proveedores de ejemplo${createAccounts ? `, ${createdAccounts} cuentas creadas` : ''}`,
			200
		);

		return json(successResponse);

	} catch (error) {
		console.error('💥 Error generando proveedores de ejemplo:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};

function generatePhoneNumber(): string {
	const prefixes = ['888', '877', '866', '855', '844', '833', '822', '811'];
	const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
	const number = Math.floor(Math.random() * 90000) + 10000;
	return `${prefix}${number}`;
}

function generateAddress(): string {
	const colonias = [
		'Colonia Centroamérica',
		'Colonia Los Robles',
		'Colonia Las Palmas',
		'Colonia Altamira',
		'Colonia Bello Horizonte',
		'Colonia Linda Vista',
		'Colonia San Judas',
		'Colonia San Sebastián',
		'Colonia Monseñor Lezcano',
		'Colonia Santo Domingo'
	];
	
	const colonia = colonias[Math.floor(Math.random() * colonias.length)];
	const numero = Math.floor(Math.random() * 100) + 1;
	return `${colonia}, Casa #${numero}, Managua, Nicaragua`;
}

function generateEmail(nombre: string): string {
	const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
	const domain = domains[Math.floor(Math.random() * domains.length)];
	const randomNum = Math.floor(Math.random() * 1000);
	return `${nombre}${randomNum}@${domain}`;
}

function generateTemporaryPassword(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let password = '';
	for (let i = 0; i < 12; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
} 