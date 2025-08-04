import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

export const GET: RequestHandler = async ({ setHeaders }) => {
	try {
		// Crear el contenido del template CSV
		const csvContent = `Timestamp,ID_Aplicacion,Nombre,Apellido,Email,Telefono,Departamento,Direccion,Tipo_Proveedor,Titulo_Servicio,Descripcion,Precio_Hora,Experiencia_Anos,Disponibilidad,Categorias,Estado,Fecha_Creacion,Estado_Revision,Nombre_Negocio,Portfolio,Referencias,Certificaciones,Documentos_ID,Licencias,Seguros,Notas_Admin
2024-01-15T10:30:00Z,APP-2024-001,Roberto,Martínez Silva,roberto.martinez@email.com,+505 8888-1234,Managua,Colonia Centroamérica Casa #45 Managua,Individual,Fontanero Profesional,Especialista en instalaciones de agua potable reparación de tuberías instalación de grifos y sanitarios. Experiencia en proyectos residenciales y comerciales.,350,8,Lunes a Viernes 8:00 AM - 6:00 PM Sábados 8:00 AM - 2:00 PM,Fontaneros Plomería,Pendiente,2024-01-15,Pendiente de revisión,,https://roberto-fontanero.portfolio.com,María López - +505 7777-8888 Carlos Ramírez - +505 6666-9999,Certificado Técnico en Fontanería - INATEC,Cédula: 001-123456-0000X,Licencia Municipal de Fontanería #2024-001,Seguro de Responsabilidad Civil - Seguros América,Cliente recomendado por proveedor existente
2024-01-16T14:20:00Z,APP-2024-002,Ana,Rodríguez Vega,ana.rodriguez@jardinesverdes.com,+505 7777-5678,Granada,Calle Real Edificio Central Granada,Empresa,Jardinería y Paisajismo Profesional,Servicios completos de jardinería diseño de paisajes mantenimiento de áreas verdes poda de árboles y plantas ornamentales.,450,12,Lunes a Domingo 7:00 AM - 5:00 PM,Jardinería Paisajismo,En Revisión,2024-01-16,En proceso de verificación,Jardines Verdes S.A.,https://jardinesverdes.com/portfolio,Hotel Plaza Colón - +505 2552-1234 Residencial Los Pinos - +505 2552-5678,Certificado en Paisajismo - Universidad Nacional Certificado en Botánica,RUC: J0310000123456,Licencia Municipal de Jardinería #2024-002 Permiso Ambiental #2024-003,Seguro Integral de Jardinería - Seguros Nicaragua,Empresa establecida buenas referencias
2024-01-17T09:15:00Z,APP-2024-003,Luis,Herrera Mendoza,luis.herrera@email.com,+505 6666-9012,León,Barrio San Juan Casa #23 León,Individual,Electricista Residencial y Comercial,Instalaciones eléctricas residenciales y comerciales reparación de circuitos instalación de paneles solares mantenimiento preventivo.,400,6,Lunes a Sábado 7:00 AM - 7:00 PM,Electricistas Energía Solar,Aprobado,2024-01-17,Aprobado - Entrevista programada,,,José Pérez - +505 5555-1234 Carmen Ruiz - +505 4444-5678,Técnico en Electricidad - INATEC Certificado en Energía Solar,Cédula: 001-234567-0000Y,Licencia de Electricista #2024-003,Seguro de Trabajo Eléctrico,Excelente experiencia técnica recomendado
2024-01-18T11:45:00Z,APP-2024-004,Carmen,López Mendoza,carmen.lopez@email.com,+505 5555-4321,Managua,Colonia Los Robles Casa #12 Managua,Individual,Limpieza Profesional Residencial y Comercial,Servicios de limpieza profunda para hogares y oficinas. Especializada en limpieza post-construcción y mantenimiento regular.,300,4,Lunes a Viernes 7:00 AM - 5:00 PM Fines de semana bajo demanda,Limpieza Mantenimiento,Pendiente,2024-01-18,Pendiente de revisión,,,María González - +505 4444-1111 Juan Pérez - +505 3333-2222,Certificado en Limpieza Profesional - INATEC,Cédula: 001-345678-0000Z,Licencia Municipal de Limpieza #2024-004,Seguro de Responsabilidad Civil,Cliente con experiencia comprobable
2024-01-19T16:30:00Z,APP-2024-005,Carlos,Ramírez Vega,carlos.ramirez@construcciones.com,+505 4444-8765,Managua,Colonia Centroamérica Edificio #8 Managua,Empresa,Construcción y Remodelación Profesional,Construcción de viviendas remodelaciones ampliaciones y reparaciones generales. Especializado en proyectos residenciales y comerciales.,500,15,Lunes a Sábado 6:00 AM - 6:00 PM,Construcción Albañilería Pintura,Aprobado,2024-01-19,Aprobado - Capacitación programada,Construcciones Ramírez S.A.,https://construcciones-ramirez.com,Residencial Las Palmas - +505 2222-3333 Edificio Central - +505 1111-4444,Ingeniero Civil - Universidad Nacional Maestro Constructor - INATEC,RUC: J0310000654321,Licencia de Constructor #2024-005 Permiso de Construcción Municipal,Seguro Integral de Construcción,Empresa con amplia experiencia y referencias sólidas`;

		// Configurar headers para descarga
		setHeaders({
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="template_proveedores_domify.csv"',
			'Cache-Control': 'no-cache'
		});

		return new Response(csvContent);

	} catch (error) {
		console.error('💥 Error generando template CSV:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
}; 