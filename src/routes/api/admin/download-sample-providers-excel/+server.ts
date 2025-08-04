import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';
import * as XLSX from 'xlsx';

export const POST: RequestHandler = async ({ request, setHeaders }) => {
	try {
		const { count = 50 } = await request.json();

		// Datos de ejemplo basados en información real de Google Maps
		const sampleProviders = [
			{
				nombre: 'TRANSARES -Transporte y extracción de aguas residuales de sumideros, fosa séptica, trampas de grasas y PTAR.',
				telefono: '86358233',
				direccion: 'Colonia Centroamérica, Casa #87, Managua, Nicaragua',
				servicios: 'Transporte y extracción de aguas residuales, Sumideros, Fosa séptica, Trampas de grasas, PTAR',
				email: 'transares387@outlook.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 488,
				experiencia: 6,
				tipo: 'Empresa',
				categorias: 'Fontaneria'
			},
			{
				nombre: 'Plomeria Murillo',
				telefono: '57589832',
				direccion: 'Colonia Centroamérica, Casa #84, Managua, Nicaragua',
				servicios: 'Plomería, Fontanería, Reparaciones de tuberías, Instalaciones sanitarias',
				email: 'plomeria.murillo231@outlook.com',
				horarios: 'Lunes a Sábado 8:00 AM - 2:00 PM',
				precio_hora: 312,
				experiencia: 10,
				tipo: 'Individual',
				categorias: 'Fontaneria'
			},
			{
				nombre: 'Servicios Martínez',
				telefono: '88831155',
				direccion: 'Colonia Centroamérica, Managua, Nicaragua',
				servicios: 'Plomería, Fontanería Menor, Reparaciones rápidas',
				email: 'plomeriamartinez19@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 300,
				experiencia: 6,
				tipo: 'Individual'
			},
			{
				nombre: 'Electricidad Rápida',
				telefono: '88845678',
				direccion: 'Colonia Los Robles, Managua, Nicaragua',
				servicios: 'Instalaciones eléctricas, Reparaciones, Mantenimiento',
				email: 'electricidad.rapida@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 400,
				experiencia: 10,
				tipo: 'Individual'
			},
			{
				nombre: 'Jardinería Express',
				telefono: '88891234',
				direccion: 'Colonia Las Palmas, Managua, Nicaragua',
				servicios: 'Jardinería, Paisajismo, Mantenimiento de áreas verdes',
				email: 'jardineria.express@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 2:00 PM',
				precio_hora: 350,
				experiencia: 7,
				tipo: 'Individual'
			},
			{
				nombre: 'Limpieza Profesional',
				telefono: '88856789',
				direccion: 'Colonia Altamira, Managua, Nicaragua',
				servicios: 'Limpieza residencial, Limpieza comercial, Limpieza post-construcción',
				email: 'limpieza.profesional@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 280,
				experiencia: 5,
				tipo: 'Individual'
			},
			{
				nombre: 'Construcciones Vega',
				telefono: '88834567',
				direccion: 'Colonia Centroamérica, Managua, Nicaragua',
				servicios: 'Construcción, Remodelaciones, Albañilería',
				email: 'construcciones.vega@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 500,
				experiencia: 15,
				tipo: 'Empresa'
			},
			{
				nombre: 'Carpintería López',
				telefono: '88878901',
				direccion: 'Colonia Los Robles, Managua, Nicaragua',
				servicios: 'Carpintería, Muebles a medida, Reparaciones',
				email: 'carpinteria.lopez@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 2:00 PM',
				precio_hora: 380,
				experiencia: 9,
				tipo: 'Individual'
			},
			{
				nombre: 'Mudanzas Express',
				telefono: '88823456',
				direccion: 'Colonia Las Palmas, Managua, Nicaragua',
				servicios: 'Mudanzas, Transporte de muebles, Embalaje',
				email: 'mudanzas.express@gmail.com',
				horarios: 'Lunes a Sábado 8:00 AM - 5:00 PM',
				precio_hora: 450,
				experiencia: 8,
				tipo: 'Empresa'
			},
			{
				nombre: 'Cerrajería 24/7',
				telefono: '88889012',
				direccion: 'Colonia Centroamérica, Managua, Nicaragua',
				servicios: 'Cerrajería, Apertura de puertas, Cambio de cerraduras',
				email: 'cerrajeria.24h@gmail.com',
				horarios: 'Lunes a Domingo 8:00 AM - 8:00 PM',
				precio_hora: 400,
				experiencia: 11,
				tipo: 'Individual'
			}
		];

		// Generar más proveedores variando los datos
		const generatedProviders = [];
		
		for (let i = 0; i < count; i++) {
			const baseProvider = sampleProviders[i % sampleProviders.length];
			const variation = Math.floor(i / sampleProviders.length);
			
			// Crear variaciones del proveedor base
			const provider = {
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

		// Crear workbook de Excel
		const workbook = XLSX.utils.book_new();
		
		// Crear hoja de datos
		const worksheet = XLSX.utils.json_to_sheet(generatedProviders);
		
		// Configurar anchos de columna
		const columnWidths = [
			{ wch: 25 }, // Nombre
			{ wch: 12 }, // Teléfono
			{ wch: 25 }, // Email
			{ wch: 40 }, // Dirección
			{ wch: 50 }, // Servicios
			{ wch: 30 }, // Horarios
			{ wch: 12 }, // Precio_Hora
			{ wch: 15 }, // Experiencia_Años
			{ wch: 12 }  // Tipo_Proveedor
		];
		worksheet['!cols'] = columnWidths;

		// Agregar hoja al workbook
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Proveedores');

		// Generar archivo Excel
		const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

		// Configurar headers para descarga
		setHeaders({
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="proveedores_ejemplo_${count}.xlsx"`,
			'Cache-Control': 'no-cache'
		});

		return new Response(excelBuffer);

	} catch (error) {
		console.error('💥 Error generando Excel de proveedores de ejemplo:', error);
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