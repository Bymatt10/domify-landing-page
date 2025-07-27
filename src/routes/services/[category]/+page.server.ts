import type { ServerLoad } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { getCategorySEO, generateCategoryMetaTags } from '$lib/category-seo';

export const load: ServerLoad = async ({ params, locals }) => {
  const { category } = params;
  const { supabase } = locals;

  if (!category) {
    throw error(404, 'Categoría no encontrada');
  }

  try {
    // Obtener configuración SEO de la categoría
    const categorySEO = getCategorySEO(category);
    if (!categorySEO) {
      throw error(404, 'Categoría no encontrada');
    }

    // Obtener proveedores de esta categoría
    const { data: providers, error: providersError } = await supabase
      .from('provider_profiles')
      .select(`
        id,
        business_name,
        bio,
        hourly_rate,
        average_rating,
        total_reviews,
        location,
        is_verified,
        is_elite,
        portfolio,
        provider_categories!inner(
          category:categories!inner(
            slug
          )
        )
      `)
      .eq('provider_categories.category.slug', category)
      .eq('is_active', true)
      .order('average_rating', { ascending: false });

    if (providersError) {
      console.error('Error fetching providers:', providersError);
    }

    // Obtener información de la categoría
    const { data: categoryInfo, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', category)
      .single();

    if (categoryError) {
      console.error('Error fetching category info:', categoryError);
    }

    // Generar metadatos SEO
    const metaTags = generateCategoryMetaTags(categorySEO);

    // Generar JSON-LD para la categoría
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": categorySEO.name,
      "description": categorySEO.description,
      "url": `https://domify.app/services/${category}`,
      "provider": {
        "@type": "Organization",
        "name": "Domify",
        "url": "https://domify.app"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Nicaragua"
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "NIO",
        "availability": "https://schema.org/InStock",
        "description": `Servicios de ${categorySEO.name} en Nicaragua`
      }
    };

    return {
      category: categoryInfo,
      providers: providers || [],
      metaTags,
      jsonLd,
      categorySEO
    };

  } catch (err) {
    console.error('Error loading category page:', err);
    throw error(500, 'Error al cargar la categoría');
  }
}; 