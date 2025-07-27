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
}

export function generateProviderJSONLD(provider: ProviderSEOData, providerId: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": provider.business_name,
    "description": provider.bio || `Servicios profesionales de ${provider.categories.join(', ')} en Nicaragua`,
    "provider": {
      "@type": "Person",
      "name": provider.business_name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": provider.location || 'Nicaragua'
      }
    },
    "areaServed": {
      "@type": "Country",
      "name": "Nicaragua"
    },
    "serviceType": provider.categories.join(', '),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": provider.average_rating,
      "reviewCount": provider.review_count
    },
    "offers": {
      "@type": "Offer",
      "price": provider.hourly_rate,
      "priceCurrency": "NIO",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": provider.hourly_rate,
        "priceCurrency": "NIO",
        "unitText": "hora"
      }
    }
  };
}

export function generateProviderMetaTags(provider: ProviderSEOData, providerId: string) {
  const title = `${provider.business_name} - ${provider.categories.join(', ')} en Nicaragua | Domify`;
  const description = provider.bio || `Contrata a ${provider.business_name} para servicios de ${provider.categories.join(', ')} en Nicaragua. Tarifa: $${provider.hourly_rate}/hora. ${provider.review_count} reseñas.`;
  const keywords = [
    provider.business_name,
    ...provider.categories,
    'servicios',
    'Nicaragua',
    'domify',
    'proveedor',
    'profesional'
  ].join(', ');
  const image = provider.portfolio?.[0]?.image_url || '/img/default-provider.jpg';
  const url = `https://domify.app/provider/${providerId}`;

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
      image
    },
    twitter: {
      card: 'summary_large_image',
      url,
      title,
      description,
      image
    }
  };
} 