import type { ServerLoad } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { generateProviderMetaTags, generateProviderJSONLD } from '$lib/seo-utils';

export const load: ServerLoad = async ({ params, locals }) => {
  const { supabase } = locals;
  const { id } = params;

  try {
    // Obtener datos del proveedor con información completa
    const { data: provider, error: providerError } = await supabase
      .from('provider_profiles')
      .select(`
        *,
        services:provider_services(*),
        categories:provider_categories(
          category:categories(*)
        ),
        reviews:reviews(*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (providerError || !provider) {
      throw error(404, 'Proveedor no encontrado');
    }

    // Obtener categorías del proveedor
    const categories = provider.categories?.map((pc: any) => pc.category?.name).filter(Boolean) || [];
    
    // Obtener servicios del proveedor
    const services = provider.services || [];
    
    // Obtener reviews
    const reviews = provider.reviews || [];

    // Calcular rating promedio
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
      : provider.average_rating || 0;

    // Preparar datos para SEO usando las utilidades
    const providerSEOData = {
      name: provider.business_name,
      business_name: provider.business_name,
      bio: provider.bio,
      location: provider.location,
      hourly_rate: provider.hourly_rate,
      average_rating: averageRating,
      review_count: reviews.length,
      categories: categories,
      services: services.map((s: any) => s.title),
      is_verified: provider.is_verified,
      is_elite: provider.is_elite || false,
      portfolio: provider.portfolio
    };

    // Generar metadatos SEO
    const seoData = generateProviderMetaTags(providerSEOData, id);
    const jsonLd = generateProviderJSONLD(providerSEOData, id);

    return {
      provider,
      categories,
      services,
      reviews,
      averageRating,
      seoData,
      jsonLd
    };

  } catch (err) {
    console.error('Error loading provider:', err);
    throw error(500, 'Error al cargar el proveedor');
  }
}; 