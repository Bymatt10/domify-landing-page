export interface ServiceTemplate {
	id: string;
	title: string;
	description: string;
	basePrice: number;
	categoryId: number;
	icon: string;
}

export const serviceTemplates: ServiceTemplate[] = [
	// ENSAMBLAJE
	{
		id: 'ensamblaje-tv',
		title: 'Montaje de TV',
		description: 'Instalación profesional de televisores en pared, incluye cableado y configuración básica.',
		basePrice: 25.00,
		categoryId: 1,
		icon: '📺'
	},
	{
		id: 'ensamblaje-muebles',
		title: 'Ensamblaje de Muebles',
		description: 'Ensamblaje de muebles de todo tipo: escritorios, estanterías, camas, mesas, etc.',
		basePrice: 30.00,
		categoryId: 1,
		icon: '🪑'
	},
	{
		id: 'ensamblaje-equipos',
		title: 'Instalación de Equipos',
		description: 'Instalación y configuración de equipos de oficina, computadoras, impresoras.',
		basePrice: 35.00,
		categoryId: 1,
		icon: '💻'
	},
	{
		id: 'ensamblaje-estanterias',
		title: 'Montaje de Estanterías',
		description: 'Instalación de estanterías, libreros y sistemas de almacenamiento.',
		basePrice: 28.00,
		categoryId: 1,
		icon: '📚'
	},

	// MONTAJE
	{
		id: 'montaje-cuadros',
		title: 'Montaje de Cuadros',
		description: 'Instalación de cuadros, espejos y decoraciones en pared.',
		basePrice: 15.00,
		categoryId: 2,
		icon: '🖼️'
	},
	{
		id: 'montaje-cortinas',
		title: 'Instalación de Cortinas',
		description: 'Instalación de cortinas, persianas y sistemas de cubierta de ventanas.',
		basePrice: 20.00,
		categoryId: 2,
		icon: '🪟'
	},
	{
		id: 'montaje-lamparas',
		title: 'Instalación de Lámparas',
		description: 'Instalación de lámparas de techo, apliques y sistemas de iluminación.',
		basePrice: 25.00,
		categoryId: 2,
		icon: '💡'
	},
	{
		id: 'montaje-ventiladores',
		title: 'Instalación de Ventiladores',
		description: 'Instalación de ventiladores de techo y sistemas de ventilación.',
		basePrice: 30.00,
		categoryId: 2,
		icon: '🌀'
	},

	// MUDANZAS
	{
		id: 'mudanzas-residencial',
		title: 'Mudanza Residencial',
		description: 'Mudanza completa de casa o apartamento con embalaje y desembalaje.',
		basePrice: 150.00,
		categoryId: 3,
		icon: '🏠'
	},
	{
		id: 'mudanzas-oficina',
		title: 'Mudanza de Oficina',
		description: 'Mudanza de oficina con cuidado especial para equipos y mobiliario.',
		basePrice: 200.00,
		categoryId: 3,
		icon: '🏢'
	},
	{
		id: 'mudanzas-express',
		title: 'Mudanza Express',
		description: 'Mudanza rápida para pocas cosas, ideal para estudiantes o solteros.',
		basePrice: 80.00,
		categoryId: 3,
		icon: '⚡'
	},
	{
		id: 'mudanzas-piano',
		title: 'Traslado de Piano',
		description: 'Traslado especializado de pianos y instrumentos musicales grandes.',
		basePrice: 120.00,
		categoryId: 3,
		icon: '🎹'
	},

	// LIMPIEZA
	{
		id: 'limpieza-residencial',
		title: 'Limpieza Residencial',
		description: 'Limpieza profunda de casas y apartamentos con productos eco-friendly.',
		basePrice: 40.00,
		categoryId: 4,
		icon: '🏡'
	},
	{
		id: 'limpieza-oficina',
		title: 'Limpieza de Oficina',
		description: 'Limpieza profesional de oficinas y espacios comerciales.',
		basePrice: 50.00,
		categoryId: 4,
		icon: '🏢'
	},
	{
		id: 'limpieza-post-obra',
		title: 'Limpieza Post-Obra',
		description: 'Limpieza especializada después de remodelaciones o construcciones.',
		basePrice: 60.00,
		categoryId: 4,
		icon: '🧹'
	},
	{
		id: 'limpieza-alfombras',
		title: 'Limpieza de Alfombras',
		description: 'Limpieza profunda de alfombras y tapetes con equipos especializados.',
		basePrice: 35.00,
		categoryId: 4,
		icon: '🟫'
	},

	// JARDINERÍA
	{
		id: 'jardineria-mantenimiento',
		title: 'Mantenimiento de Jardines',
		description: 'Mantenimiento regular de jardines: poda, riego, fertilización.',
		basePrice: 45.00,
		categoryId: 5,
		icon: '🌱'
	},
	{
		id: 'jardineria-diseno',
		title: 'Diseño de Jardines',
		description: 'Diseño y creación de jardines paisajísticos personalizados.',
		basePrice: 80.00,
		categoryId: 5,
		icon: '🎨'
	},
	{
		id: 'jardineria-poda',
		title: 'Poda de Árboles',
		description: 'Poda profesional de árboles y arbustos con equipos de seguridad.',
		basePrice: 55.00,
		categoryId: 5,
		icon: '🌳'
	},
	{
		id: 'jardineria-sistema-riego',
		title: 'Instalación de Riego',
		description: 'Instalación y mantenimiento de sistemas de riego automático.',
		basePrice: 70.00,
		categoryId: 5,
		icon: '💧'
	}
];

export function getTemplatesByCategory(categoryId: number): ServiceTemplate[] {
	return serviceTemplates.filter(template => template.categoryId === categoryId);
}

export function getTemplateById(templateId: string): ServiceTemplate | undefined {
	return serviceTemplates.find(template => template.id === templateId);
}

export function getTemplatesByCategoryName(categoryName: string): ServiceTemplate[] {
	const categoryMap: { [key: string]: number } = {
		'Ensamblaje': 1,
		'Montaje': 2,
		'Mudanzas': 3,
		'Limpieza': 4,
		'Jardinería': 5
	};
	
	const categoryId = categoryMap[categoryName];
	return categoryId ? getTemplatesByCategory(categoryId) : [];
} 