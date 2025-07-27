/**
 * Configuración SEO general del sitio
 */

export interface SiteSEO {
  title: string;
  description: string;
  keywords: string[];
  image: string;
  url: string;
}

export const siteSEOConfig: Record<string, SiteSEO> = {
  home: {
    title: 'Domify - Servicios Profesionales en Nicaragua | Encuentra Proveedores Confiables',
    description: 'Domify conecta clientes con profesionales verificados en Nicaragua. Servicios de limpieza, jardinería, ensamblaje, plomería y más. Contrata con confianza.',
    keywords: ['servicios Nicaragua', 'profesionales', 'limpieza', 'jardinería', 'ensamblaje', 'domify', 'proveedores'],
    image: '/img/domify-home.jpg',
    url: 'https://domify.app'
  },
  about: {
    title: 'Sobre Domify - Conectando Profesionales con Clientes en Nicaragua',
    description: 'Conoce más sobre Domify, la plataforma que revoluciona la contratación de servicios profesionales en Nicaragua. Nuestra misión y valores.',
    keywords: ['domify Nicaragua', 'plataforma servicios', 'misión', 'valores', 'sobre nosotros'],
    image: '/img/domify-about.jpg',
    url: 'https://domify.app/about'
  },
  contact: {
    title: 'Contacto - Domify Nicaragua | Soporte y Atención al Cliente',
    description: 'Contáctanos para cualquier consulta sobre nuestros servicios. Soporte técnico, atención al cliente y más información sobre Domify.',
    keywords: ['contacto domify', 'soporte', 'atención cliente', 'consultas', 'Nicaragua'],
    image: '/img/domify-contact.jpg',
    url: 'https://domify.app/contact'
  },
  becomeProvider: {
    title: 'Únete como Proveedor - Domify Nicaragua | Gana Dinero con tus Habilidades',
    description: 'Conviértete en proveedor de servicios en Domify. Gana dinero ofreciendo tus habilidades profesionales. Registro gratuito y fácil.',
    keywords: ['proveedor domify', 'ganar dinero', 'servicios profesionales', 'registro', 'Nicaragua'],
    image: '/img/domify-provider.jpg',
    url: 'https://domify.app/become-provider'
  }
};

export function generateSiteMetaTags(page: string, customData?: Partial<SiteSEO>) {
  const baseConfig = siteSEOConfig[page] || siteSEOConfig.home;
  const config = { ...baseConfig, ...customData };

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords.join(', '),
    og: {
      type: 'website',
      url: config.url,
      title: config.title,
      description: config.description,
      image: `https://domify.app${config.image}`
    },
    twitter: {
      card: 'summary_large_image',
      url: config.url,
      title: config.title,
      description: config.description,
      image: `https://domify.app${config.image}`
    }
  };
}

export function generateSiteJSONLD(page: string) {
  const baseConfig = siteSEOConfig[page] || siteSEOConfig.home;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Domify",
    "description": baseConfig.description,
    "url": baseConfig.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://domify.app/services?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Domify",
      "url": "https://domify.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://domify.app/icon-domify.png"
      }
    }
  };
} 