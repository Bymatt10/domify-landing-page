/**
 * Configuración SEO para categorías de servicios
 */

export interface CategorySEO {
  name: string;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  image: string;
}

export const categorySEOConfig: Record<string, CategorySEO> = {
  'ensamblaje': {
    name: 'Ensamblaje',
    slug: 'ensamblaje',
    title: 'Servicios de Ensamblaje en Nicaragua | Domify - Muebles y Equipos',
    description: 'Contrata profesionales para ensamblaje de muebles, equipos electrónicos y más en Nicaragua. Servicio rápido y confiable.',
    keywords: ['ensamblaje Nicaragua', 'muebles', 'equipos', 'montaje', 'servicios', 'domify'],
    image: '/img/assembly.png'
  },
  'limpieza': {
    name: 'Limpieza',
    slug: 'limpieza',
    title: 'Servicios de Limpieza Profesional en Nicaragua | Domify',
    description: 'Servicios de limpieza profesional para hogares y oficinas en Nicaragua. Limpieza regular y profunda con personal capacitado.',
    keywords: ['limpieza Nicaragua', 'limpieza hogar', 'limpieza oficina', 'servicios domésticos', 'domify'],
    image: '/img/cleaning.png'
  },
  'jardineria': {
    name: 'Jardinería',
    slug: 'jardineria',
    title: 'Servicios de Jardinería en Nicaragua | Domify - Cuidado de Jardines',
    description: 'Servicios profesionales de jardinería en Nicaragua. Poda, mantenimiento, diseño y cuidado de jardines residenciales y comerciales.',
    keywords: ['jardinería Nicaragua', 'poda', 'mantenimiento jardines', 'diseño jardines', 'domify'],
    image: '/img/gardening.png'
  },
  'montaje': {
    name: 'Montaje',
    slug: 'montaje',
    title: 'Servicios de Montaje en Nicaragua | Domify - Instalación Profesional',
    description: 'Servicios de montaje e instalación profesional en Nicaragua. TV, estantes, cuadros y más con garantía de calidad.',
    keywords: ['montaje Nicaragua', 'instalación', 'TV', 'estantes', 'cuadros', 'domify'],
    image: '/img/mounting.png'
  },
  'mudanza': {
    name: 'Mudanza',
    slug: 'mudanza',
    title: 'Servicios de Mudanza en Nicaragua | Domify - Traslados Seguros',
    description: 'Servicios de mudanza profesional en Nicaragua. Traslados seguros y eficientes con personal capacitado y equipamiento adecuado.',
    keywords: ['mudanza Nicaragua', 'traslados', 'mudanzas', 'servicios logísticos', 'domify'],
    image: '/img/moving.png'
  },
  'plomeria': {
    name: 'Plomería',
    slug: 'plomeria',
    title: 'Servicios de Plomería en Nicaragua | Domify - Reparaciones Rápidas',
    description: 'Servicios de plomería profesional en Nicaragua. Reparaciones, instalaciones y mantenimiento con garantía y precios justos.',
    keywords: ['plomería Nicaragua', 'reparaciones', 'instalaciones', 'fontanería', 'domify'],
    image: '/img/plumbing.png'
  },
  'electricidad': {
    name: 'Electricidad',
    slug: 'electricidad',
    title: 'Servicios Eléctricos en Nicaragua | Domify - Instalaciones Seguras',
    description: 'Servicios eléctricos profesionales en Nicaragua. Instalaciones, reparaciones y mantenimiento con técnicos certificados.',
    keywords: ['electricidad Nicaragua', 'instalaciones eléctricas', 'reparaciones', 'técnicos', 'domify'],
    image: '/img/electrical.png'
  },
  'construccion': {
    name: 'Construcción',
    slug: 'construccion',
    title: 'Servicios de Construcción en Nicaragua | Domify - Obras Profesionales',
    description: 'Servicios de construcción y remodelación en Nicaragua. Obras pequeñas y medianas con calidad profesional y precios competitivos.',
    keywords: ['construcción Nicaragua', 'remodelación', 'obras', 'albañilería', 'domify'],
    image: '/img/construction.png'
  },
  'pintura': {
    name: 'Pintura',
    slug: 'pintura',
    title: 'Servicios de Pintura en Nicaragua | Domify - Acabados Profesionales',
    description: 'Servicios de pintura profesional en Nicaragua. Pintura interior, exterior y acabados especiales con materiales de calidad.',
    keywords: ['pintura Nicaragua', 'pintura interior', 'pintura exterior', 'acabados', 'domify'],
    image: '/img/painting.png'
  },
  'cerrajeria': {
    name: 'Cerrajería',
    slug: 'cerrajeria',
    title: 'Servicios de Cerrajería en Nicaragua | Domify - Apertura y Reparación',
    description: 'Servicios de cerrajería profesional en Nicaragua. Apertura de cerraduras, cambio de llaves y reparación con técnicos especializados.',
    keywords: ['cerrajería Nicaragua', 'apertura cerraduras', 'cambio llaves', 'reparación cerraduras', 'domify'],
    image: '/img/locksmith.png'
  },
  'electricistas': {
    name: 'Electricistas',
    slug: 'electricistas',
    title: 'Servicios de Electricistas en Nicaragua | Domify - Instalaciones Eléctricas',
    description: 'Servicios de electricistas profesionales en Nicaragua. Instalaciones, reparaciones y mantenimiento eléctrico residencial y comercial.',
    keywords: ['electricistas Nicaragua', 'instalaciones eléctricas', 'reparaciones eléctricas', 'mantenimiento eléctrico', 'domify'],
    image: '/img/electrical.png'
  },
  'fontaneros': {
    name: 'Fontaneros',
    slug: 'fontaneros',
    title: 'Servicios de Fontaneros en Nicaragua | Domify - Plomería Profesional',
    description: 'Servicios de fontaneros profesionales en Nicaragua. Reparación e instalación de sistemas de fontanería y tuberías.',
    keywords: ['fontaneros Nicaragua', 'plomería', 'fontanería', 'tuberías', 'reparaciones', 'domify'],
    image: '/img/plumbing.png'
  },
  'albanileria': {
    name: 'Albañilería',
    slug: 'albanileria',
    title: 'Servicios de Albañilería en Nicaragua | Domify - Construcción Profesional',
    description: 'Servicios de albañilería profesional en Nicaragua. Construcción, remodelación y acabados en general.',
    keywords: ['albañilería Nicaragua', 'construcción', 'remodelación', 'acabados', 'obras', 'domify'],
    image: '/img/construction.png'
  },
  'carpinteria': {
    name: 'Carpintería',
    slug: 'carpinteria',
    title: 'Servicios de Carpintería en Nicaragua | Domify - Muebles y Reparaciones',
    description: 'Servicios de carpintería profesional en Nicaragua. Fabricación y reparación de muebles de madera.',
    keywords: ['carpintería Nicaragua', 'muebles', 'reparación muebles', 'madera', 'fabricación', 'domify'],
    image: '/img/carpentry.png'
  }
};

export function getCategorySEO(slug: string): CategorySEO | null {
  return categorySEOConfig[slug] || null;
}

export function generateCategoryMetaTags(category: CategorySEO) {
  return {
    title: category.title,
    description: category.description,
    keywords: category.keywords.join(', '),
    og: {
      type: 'website',
      url: `https://domify.app/services/${category.slug}`,
      title: category.title,
      description: category.description,
      image: `https://domify.app${category.image}`
    },
    twitter: {
      card: 'summary_large_image',
      url: `https://domify.app/services/${category.slug}`,
      title: category.title,
      description: category.description,
      image: `https://domify.app${category.image}`
    }
  };
} 