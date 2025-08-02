import type { PageServerLoad } from './$types';
import { generateCategoryMetaTags, generateCategoryJSONLD } from '$lib/seo-utils';

export const load: PageServerLoad = async ({ params, locals }) => {
	const category = params.category;
	
	// Datos de ejemplo para mostrar cómo se vería la página con contenido
	const sampleProviders = [
		{
			id: '1',
			business_name: 'Juan Pérez Servicios',
			description: 'Especialista en ensamblaje de muebles y reparaciones menores. Más de 5 años de experiencia brindando servicios de calidad.',
			bio: 'Especialista en ensamblaje de muebles y reparaciones menores. Más de 5 años de experiencia brindando servicios de calidad.',
			hourly_rate: 350.00,
			average_rating: 4.8,
			rating: 4.8,
			photo_url: '/img/assembly.png',
			location: 'Managua, Nicaragua',
			phone: '+505 8888-8888',
			total_reviews: 12,
			provider_type: 'individual',
			user_id: 'user1',
			users: {
				id: 'user1',
				email: 'juan.perez@example.com',
				role: 'provider'
			},
			portfolio: [
				{
					id: '1',
					title: 'Ensamblaje de Sala Completa',
					description: 'Ensamblé una sala completa de 7 piezas para familia en Managua. Cliente muy satisfecho con la calidad y rapidez del trabajo.',
					image_url: '/img/assembly.png',
					media_type: 'image'
				},
				{
					id: '2',
					title: 'Reparación de Closet',
					description: 'Reparé las puertas y cajones de un closet que estaban dañados. Trabajo incluye ajuste de bisagras y cambio de rieles.',
					image_url: '/img/mounting.png',
					media_type: 'image'
				}
			],
			reviews: [
				{
					id: '1',
					rating: 5,
					comment: 'Excelente trabajo, muy profesional y puntual. Recomendado 100%.',
					reviewer_name: 'María González',
					created_at: '2024-01-15T10:00:00Z'
				},
				{
					id: '2',
					rating: 4,
					comment: 'Buen servicio, el trabajo quedó bien hecho.',
					reviewer_name: 'Carlos Rodríguez',
					created_at: '2024-01-10T14:30:00Z'
				}
			]
		},
		{
			id: '2',
			business_name: 'Limpieza Profesional Ana',
			description: 'Servicios de limpieza residencial y comercial. Especializada en limpieza profunda y mantenimiento regular.',
			bio: 'Servicios de limpieza residencial y comercial. Especializada en limpieza profunda y mantenimiento regular.',
			hourly_rate: 250.00,
			average_rating: 4.9,
			rating: 4.9,
			photo_url: '/img/cleaning.png',
			location: 'Granada, Nicaragua',
			phone: '+505 7777-7777',
			total_reviews: 8,
			provider_type: 'individual',
			user_id: 'user2',
			users: {
				id: 'user2',
				email: 'ana.limpieza@example.com',
				role: 'provider'
			},
			portfolio: [
				{
					id: '3',
					title: 'Limpieza de Casa Completa',
					description: 'Limpieza profunda de casa de 3 habitaciones. Incluyó limpieza de cocina, baños y áreas comunes.',
					image_url: '/img/cleaning.png',
					media_type: 'image'
				}
			],
			reviews: [
				{
					id: '3',
					rating: 5,
					comment: 'Ana es muy profesional y detallista. Mi casa quedó impecable.',
					reviewer_name: 'Sofia Martínez',
					created_at: '2024-01-12T09:00:00Z'
				}
			]
		},
		{
			id: '3',
			business_name: 'Jardinería Verde',
			description: 'Servicios de jardinería y paisajismo. Diseño, mantenimiento y cuidado de jardines residenciales.',
			bio: 'Servicios de jardinería y paisajismo. Diseño, mantenimiento y cuidado de jardines residenciales.',
			hourly_rate: 300.00,
			average_rating: 4.7,
			rating: 4.7,
			photo_url: '/img/gardening.png',
			location: 'León, Nicaragua',
			phone: '+505 6666-6666',
			total_reviews: 15,
			provider_type: 'individual',
			user_id: 'user3',
			users: {
				id: 'user3',
				email: 'jardineria.verde@example.com',
				role: 'provider'
			},
			portfolio: [
				{
					id: '4',
					title: 'Diseño de Jardín',
					description: 'Diseño y creación de jardín tropical en residencia privada. Incluyó selección de plantas y sistema de riego.',
					image_url: '/img/gardening.png',
					media_type: 'image'
				}
			],
			reviews: [
				{
					id: '4',
					rating: 5,
					comment: 'Excelente trabajo de jardinería. El jardín quedó hermoso.',
					reviewer_name: 'Roberto Silva',
					created_at: '2024-01-08T16:00:00Z'
				}
			]
		}
	];

	// Filtrar proveedores según la categoría
	let filteredProviders = sampleProviders;
	
	// Mapeo de categorías a tipos de servicios
	const categoryMapping: Record<string, string[]> = {
		'ensamblaje': ['ensamblaje', 'muebles', 'montaje'],
		'limpieza-casas': ['limpieza', 'limpieza residencial'],
		'jardineria': ['jardinería', 'paisajismo'],
		'electricistas': ['electricidad', 'instalaciones eléctricas'],
		'fontaneros': ['plomería', 'fontanería'],
		'construccion': ['construcción', 'remodelación'],
		'pintura': ['pintura', 'pintor'],
		'mudanzas': ['mudanza', 'traslado'],
		'carpinteria': ['carpintería', 'ebanistería'],
		'tecnologia': ['tecnología', 'computación'],
		'seguridad': ['seguridad', 'vigilancia'],
		'albañileria': ['albañilería', 'mampostería']
	};

	// Si es una categoría específica, filtrar proveedores
	if (category && categoryMapping[category]) {
		// Para este ejemplo, mostrar todos los proveedores
		// En una implementación real, filtrarías por categoría
		filteredProviders = sampleProviders;
	}

	// Generar datos SEO para la categoría
	const categoryData = {
		name: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
		slug: category,
		description: `Encuentra los mejores proveedores de ${category.replace(/-/g, ' ')} en Nicaragua. Servicios profesionales verificados con garantía de calidad.`,
		providers_count: filteredProviders.length,
		average_rate: filteredProviders.length > 0 ? filteredProviders.reduce((sum, p) => sum + p.average_rating, 0) / filteredProviders.length : undefined,
		services: categoryMapping[category] || [],
		parent_category: 'Servicios'
	};

	// Generar metadatos SEO
	const seoData = generateCategoryMetaTags(categoryData);
	const jsonLd = generateCategoryJSONLD(categoryData);

	return {
		category: categoryData,
		providers: filteredProviders,
		preloaded: true,
		seoData,
		jsonLd
	};
}; 