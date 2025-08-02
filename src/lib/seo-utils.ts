/**
 * Utilidades para SEO y metadatos
 */

export interface ProviderSEOData {
  name: string;
  business_name: string;
  bio?: string;
  location?: string;
  hourly_rate: number;
  average_rating: number;
  review_count: number;
  categories: string[];
  services: string[];
  is_verified: boolean;
  is_elite?: boolean;
  portfolio?: any[];
  phone?: string;
}

export interface CategorySEOData {
  name: string;
  slug: string;
  description?: string;
  providers_count: number;
  average_rate?: number;
  services?: string[];
  parent_category?: string;
}

export function generateProviderJSONLD(provider: ProviderSEOData, providerId: string) {
  const baseUrl = 'https://domify.app';
  
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/provider/${providerId}`,
    "name": provider.business_name,
    "description": provider.bio || `Servicios profesionales de ${provider.categories.join(', ')} en Nicaragua`,
    "url": `${baseUrl}/provider/${providerId}`,
    "telephone": provider.phone || "",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": provider.location || 'Nicaragua',
      "addressCountry": "NI"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Nicaragua"
    },
    "serviceType": provider.categories,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Servicios",
      "itemListElement": provider.services.map(service => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service
        }
      }))
    },
    "aggregateRating": provider.review_count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": provider.average_rating,
      "reviewCount": provider.review_count,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "offers": {
      "@type": "Offer",
      "price": provider.hourly_rate,
      "priceCurrency": "NIO",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": provider.hourly_rate,
        "priceCurrency": "NIO",
        "unitText": "hora"
      },
      "availability": "https://schema.org/InStock"
    },
    "image": provider.portfolio?.[0]?.image_url || `${baseUrl}/img/default-provider.jpg`,
    "sameAs": [
      `${baseUrl}/services/${provider.categories[0]?.toLowerCase()}`
    ]
  };
}

export function generateCategoryJSONLD(category: CategorySEOData) {
  const baseUrl = 'https://domify.app';
  
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Servicios de ${category.name}`,
    "description": category.description || `Encuentra los mejores proveedores de ${category.name} en Nicaragua. ${category.providers_count} profesionales disponibles.`,
    "url": `${baseUrl}/services/${category.slug}`,
    "provider": {
      "@type": "Organization",
      "name": "Domify",
      "url": baseUrl
    },
    "areaServed": {
      "@type": "Country",
      "name": "Nicaragua"
    },
    "serviceType": category.name,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `Servicios de ${category.name}`,
      "itemListElement": category.services?.map(service => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service
        }
      })) || []
    },
    "aggregateRating": category.average_rate ? {
      "@type": "AggregateRating",
      "ratingValue": category.average_rate,
      "reviewCount": category.providers_count,
      "bestRating": 5,
      "worstRating": 1
    } : undefined
  };
}

export function generateProviderMetaTags(provider: ProviderSEOData, providerId: string) {
  const baseUrl = 'https://domify.app';
  const title = `${provider.business_name} - ${provider.categories.join(', ')} en Nicaragua | Domify`;
  const description = provider.bio 
    ? `${provider.bio.substring(0, 150)}... Contrata a ${provider.business_name} para servicios profesionales. Tarifa: $${provider.hourly_rate}/hora. ${provider.review_count} reseñas verificadas.`
    : `Contrata a ${provider.business_name} para servicios de ${provider.categories.join(', ')} en Nicaragua. Tarifa: $${provider.hourly_rate}/hora. ${provider.review_count} reseñas verificadas.`;
  
  const keywords = [
    provider.business_name,
    ...provider.categories,
    'servicios profesionales',
    'Nicaragua',
    'domify',
    'proveedor verificado',
    'servicios a domicilio',
    'limpieza',
    'jardinería',
    'montaje',
    'mudanzas'
  ].join(', ');
  
  const image = provider.portfolio?.[0]?.image_url || `${baseUrl}/img/default-provider.jpg`;
  const url = `${baseUrl}/provider/${providerId}`;

  return {
    title,
    description,
    keywords,
    image,
    url,
    og: {
      type: 'profile',
      url,
      title,
      description,
      image,
      site_name: 'Domify',
      locale: 'es_NI',
      // Facebook específico
      image_width: 1200,
      image_height: 630,
      image_alt: `${provider.business_name} - Servicios profesionales en Nicaragua`
    },
    twitter: {
      card: 'summary_large_image',
      url,
      title,
      description,
      image,
      site: '@domify_app',
      creator: '@domify_app',
      // Twitter/X específico
      image_alt: `${provider.business_name} - Servicios profesionales en Nicaragua`
    },
    // WhatsApp específico
    whatsapp: {
      title,
      description: `${provider.business_name} - ${provider.categories.join(', ')} en Nicaragua. Tarifa: $${provider.hourly_rate}/hora. ${provider.review_count} reseñas.`,
      image,
      url
    },
    // Reddit específico
    reddit: {
      title,
      description,
      image,
      url
    },
    // LinkedIn específico
    linkedin: {
      title,
      description,
      image,
      url
    },
    canonical: url
  };
}

export function generateCategoryMetaTags(category: CategorySEOData) {
  const baseUrl = 'https://domify.app';
  const title = `Servicios de ${category.name} en Nicaragua - ${category.providers_count} Proveedores | Domify`;
  const description = category.description 
    ? `${category.description.substring(0, 150)}... Encuentra ${category.providers_count} proveedores verificados de ${category.name} en Nicaragua.`
    : `Encuentra los mejores proveedores de ${category.name} en Nicaragua. ${category.providers_count} profesionales verificados disponibles. Contrata servicios de calidad con garantía.`;
  
  const keywords = [
    category.name,
    'servicios',
    'Nicaragua',
    'domify',
    'proveedores',
    'profesionales',
    'servicios a domicilio',
    category.parent_category || '',
    'contratar servicios'
  ].filter(Boolean).join(', ');
  
  const image = `${baseUrl}/img/categories/${category.slug}.jpg`;
  const url = `${baseUrl}/services/${category.slug}`;

  return {
    title,
    description,
    keywords,
    image,
    url,
    og: {
      type: 'website',
      url,
      title,
      description,
      image,
      site_name: 'Domify',
      locale: 'es_NI',
      // Facebook específico
      image_width: 1200,
      image_height: 630,
      image_alt: `Servicios de ${category.name} en Nicaragua - ${category.providers_count} proveedores`
    },
    twitter: {
      card: 'summary_large_image',
      url,
      title,
      description,
      image,
      site: '@domify_app',
      creator: '@domify_app',
      // Twitter/X específico
      image_alt: `Servicios de ${category.name} en Nicaragua - ${category.providers_count} proveedores`
    },
    // WhatsApp específico
    whatsapp: {
      title,
      description: `Servicios de ${category.name} en Nicaragua. ${category.providers_count} proveedores verificados disponibles.`,
      image,
      url
    },
    // Reddit específico
    reddit: {
      title,
      description,
      image,
      url
    },
    // LinkedIn específico
    linkedin: {
      title,
      description,
      image,
      url
    },
    canonical: url
  };
}

export function generateHomeMetaTags() {
  const baseUrl = 'https://domify.app';
  const title = 'Domify - Marketplace de Servicios Profesionales en Nicaragua';
  const description = 'Encuentra y contrata los mejores proveedores de servicios profesionales en Nicaragua. Limpieza, jardinería, montaje, electricistas y más. Servicios verificados con garantía de calidad.';
  const image = `${baseUrl}/icon-domify.png`;
  const url = baseUrl;

  return {
    title,
    description,
    keywords: 'servicios profesionales, Nicaragua, domify, limpieza, jardinería, montaje, electricistas, fontaneros, construcción, pintura, mudanzas, carpintería, tecnología, seguridad, albañilería',
    image,
    url,
    og: {
      type: 'website',
      url,
      title,
      description,
      image,
      site_name: 'Domify',
      locale: 'es_NI',
      image_width: 1200,
      image_height: 630,
      image_alt: 'Domify - Marketplace de Servicios Profesionales en Nicaragua'
    },
    twitter: {
      card: 'summary_large_image',
      url,
      title,
      description,
      image,
      site: '@domify_app',
      creator: '@domify_app',
      image_alt: 'Domify - Marketplace de Servicios Profesionales en Nicaragua'
    },
    whatsapp: {
      title,
      description: 'Encuentra los mejores proveedores de servicios profesionales en Nicaragua. Servicios verificados con garantía de calidad.',
      image,
      url
    },
    reddit: {
      title,
      description,
      image,
      url
    },
    linkedin: {
      title,
      description,
      image,
      url
    },
    canonical: url
  };
}

export function generateBreadcrumbJSONLD(items: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateWebsiteJSONLD() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Domify",
    "url": "https://domify.app",
    "description": "Marketplace de servicios profesionales en Nicaragua. Conecta con proveedores verificados de limpieza, jardinería, montaje y más.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://domify.app/services?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
} 