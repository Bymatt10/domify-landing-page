import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';
import * as XLSX from 'xlsx';

export const GET: RequestHandler = async ({ setHeaders }) => {
	try {
		// Datos del template
		const templateData = [
			{
				Timestamp: '2024-01-15T10:30:00Z',
				ID_Aplicacion: 'APP-2024-001',
				Nombre: 'Roberto',
				Apellido: 'Martínez Silva',
				Email: 'roberto.martinez@email.com',
				Telefono: '+505 8888-1234',
				Departamento: 'Managua',
				Direccion: 'Colonia Centroamérica Casa #45 Managua',
				Tipo_Proveedor: 'Individual',
				Titulo_Servicio: 'Fontanero Profesional',
				Descripcion: 'Especialista en instalaciones de agua potable, reparación de tuberías, instalación de grifos y sanitarios. Experiencia en proyectos residenciales y comerciales.',
				Precio_Hora: 350,
				Experiencia_Anos: 8,
				Disponibilidad: 'Lunes a Viernes 8:00 AM - 6:00 PM, Sábados 8:00 AM - 2:00 PM',
				Categorias: 'Fontaneros, Plomería',
				Estado: 'Pendiente',
				Fecha_Creacion: '2024-01-15',
				Estado_Revision: 'Pendiente de revisión',
				Nombre_Negocio: '',
				Portfolio: 'https://roberto-fontanero.portfolio.com',
				Referencias: 'María López - +505 7777-8888, Carlos Ramírez - +505 6666-9999',
				Certificaciones: 'Certificado Técnico en Fontanería - INATEC',
				Documentos_ID: 'Cédula: 001-123456-0000X',
				Licencias: 'Licencia Municipal de Fontanería #2024-001',
				Seguros: 'Seguro de Responsabilidad Civil - Seguros América',
				Notas_Admin: 'Cliente recomendado por proveedor existente'
			},
			{
				Timestamp: '2024-01-16T14:20:00Z',
				ID_Aplicacion: 'APP-2024-002',
				Nombre: 'Ana',
				Apellido: 'Rodríguez Vega',
				Email: 'ana.rodriguez@jardinesverdes.com',
				Telefono: '+505 7777-5678',
				Departamento: 'Granada',
				Direccion: 'Calle Real Edificio Central Granada',
				Tipo_Proveedor: 'Empresa',
				Titulo_Servicio: 'Jardinería y Paisajismo Profesional',
				Descripcion: 'Servicios completos de jardinería, diseño de paisajes, mantenimiento de áreas verdes, poda de árboles y plantas ornamentales.',
				Precio_Hora: 450,
				Experiencia_Anos: 12,
				Disponibilidad: 'Lunes a Domingo 7:00 AM - 5:00 PM',
				Categorias: 'Jardinería, Paisajismo',
				Estado: 'En Revisión',
				Fecha_Creacion: '2024-01-16',
				Estado_Revision: 'En proceso de verificación',
				Nombre_Negocio: 'Jardines Verdes S.A.',
				Portfolio: 'https://jardinesverdes.com/portfolio',
				Referencias: 'Hotel Plaza Colón - +505 2552-1234, Residencial Los Pinos - +505 2552-5678',
				Certificaciones: 'Certificado en Paisajismo - Universidad Nacional, Certificado en Botánica',
				Documentos_ID: 'RUC: J0310000123456',
				Licencias: 'Licencia Municipal de Jardinería #2024-002, Permiso Ambiental #2024-003',
				Seguros: 'Seguro Integral de Jardinería - Seguros Nicaragua',
				Notas_Admin: 'Empresa establecida, buenas referencias'
			},
			{
				Timestamp: '2024-01-17T09:15:00Z',
				ID_Aplicacion: 'APP-2024-003',
				Nombre: 'Luis',
				Apellido: 'Herrera Mendoza',
				Email: 'luis.herrera@email.com',
				Telefono: '+505 6666-9012',
				Departamento: 'León',
				Direccion: 'Barrio San Juan Casa #23 León',
				Tipo_Proveedor: 'Individual',
				Titulo_Servicio: 'Electricista Residencial y Comercial',
				Descripcion: 'Instalaciones eléctricas residenciales y comerciales, reparación de circuitos, instalación de paneles solares, mantenimiento preventivo.',
				Precio_Hora: 400,
				Experiencia_Anos: 6,
				Disponibilidad: 'Lunes a Sábado 7:00 AM - 7:00 PM',
				Categorias: 'Electricistas, Energía Solar',
				Estado: 'Aprobado',
				Fecha_Creacion: '2024-01-17',
				Estado_Revision: 'Aprobado - Entrevista programada',
				Nombre_Negocio: '',
				Portfolio: '',
				Referencias: 'José Pérez - +505 5555-1234, Carmen Ruiz - +505 4444-5678',
				Certificaciones: 'Técnico en Electricidad - INATEC, Certificado en Energía Solar',
				Documentos_ID: 'Cédula: 001-234567-0000Y',
				Licencias: 'Licencia de Electricista #2024-003',
				Seguros: 'Seguro de Trabajo Eléctrico',
				Notas_Admin: 'Excelente experiencia técnica, recomendado'
			}
		];

		// Crear workbook de Excel
		const workbook = XLSX.utils.book_new();
		
		// Crear hoja de datos
		const worksheet = XLSX.utils.json_to_sheet(templateData);
		
		// Configurar anchos de columna
		const columnWidths = [
			{ wch: 20 }, // Timestamp
			{ wch: 15 }, // ID_Aplicacion
			{ wch: 15 }, // Nombre
			{ wch: 20 }, // Apellido
			{ wch: 25 }, // Email
			{ wch: 15 }, // Telefono
			{ wch: 15 }, // Departamento
			{ wch: 35 }, // Direccion
			{ wch: 15 }, // Tipo_Proveedor
			{ wch: 25 }, // Titulo_Servicio
			{ wch: 50 }, // Descripcion
			{ wch: 12 }, // Precio_Hora
			{ wch: 15 }, // Experiencia_Anos
			{ wch: 35 }, // Disponibilidad
			{ wch: 20 }, // Categorias
			{ wch: 15 }, // Estado
			{ wch: 15 }, // Fecha_Creacion
			{ wch: 25 }, // Estado_Revision
			{ wch: 20 }, // Nombre_Negocio
			{ wch: 30 }, // Portfolio
			{ wch: 40 }, // Referencias
			{ wch: 35 }, // Certificaciones
			{ wch: 25 }, // Documentos_ID
			{ wch: 35 }, // Licencias
			{ wch: 35 }, // Seguros
			{ wch: 40 }  // Notas_Admin
		];
		worksheet['!cols'] = columnWidths;

		// Agregar hoja al workbook
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Proveedores');

		// Generar archivo Excel
		const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

		// Configurar headers para descarga
		setHeaders({
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': 'attachment; filename="template_proveedores_domify.xlsx"',
			'Cache-Control': 'no-cache'
		});

		return new Response(excelBuffer);

	} catch (error) {
		console.error('💥 Error generando template Excel:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
}; 