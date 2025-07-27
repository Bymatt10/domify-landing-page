import type { ServerLoad } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

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

    // Preparar datos para SEO
    const seoData = {
      title: `${provider.business_name} - ${categories.join(', ')} en Nicaragua | Domify`,
      description: provider.bio || `Contrata a ${provider.business_name} para servicios de ${categories.join(', ')} en Nicaragua. Tarifa: $${provider.hourly_rate}/hora. ${reviews.length} reseñas.`,
      keywords: [
        provider.business_name,
        ...categories,
        'servicios',
        'Nicaragua',
        'domify',
        'proveedor',
        'profesional'
      ].join(', '),
      image: provider.portfolio?.[0]?.image_url || '/img/default-provider.jpg',
      url: `https://domify.app/provider/${id}`,
      type: 'profile',
      provider: {
        name: provider.business_name,
        location: provider.location,
        hourlyRate: provider.hourly_rate,
        rating: averageRating,
        reviewCount: reviews.length,
        categories: categories,
        services: services.map((s: any) => s.title),
        isVerified: provider.is_verified,
        isElite: provider.is_elite || false
      }
    };

    return {
      provider,
      categories,
      services,
      reviews,
      averageRating,
      seoData
    };

  } catch (err) {
    console.error('Error loading provider:', err);
    throw error(500, 'Error al cargar el proveedor');
  }
}; 