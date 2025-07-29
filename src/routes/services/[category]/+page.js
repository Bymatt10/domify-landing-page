import { error } from '@sveltejs/kit';

export async function load({ params, fetch, depends }) {
  // Añadimos dependencia para invalidación de cache
  depends('app:category');

  try {
    // Ejecutar ambas peticiones en paralelo para mejorar rendimiento
    const [categoryResponse, providersResponse] = await Promise.all([
      fetch(`/api/categories/${params.category}`, {
        headers: { 'Cache-Control': 'max-age=300' } // Cache de 5 minutos
      }),
      fetch(`/api/providers?category=${params.category}&limit=10`, { // Limitar a 10 proveedores iniciales
        headers: { 'Cache-Control': 'max-age=60' } // Cache de 1 minuto
      })
    ]);

    if (!categoryResponse.ok) {
      throw error(404, { message: 'Categoría no encontrada' });
    }

    const categoryData = await categoryResponse.json();

    let providers = [];
    let preloaded = false;

    if (providersResponse.ok) {
      const providersData = await providersResponse.json();
      providers = providersData.data?.providers || [];
      preloaded = true;
    }

    return {
      category: categoryData.data.category,
      providers,
      preloaded
    };
  } catch (err) {
    console.error('Error loading category data:', err);

    if (err.status === 404) {
      // Pass through the 404 error
      throw err;
    }

    // For other errors, return a generic error
    throw error(500, { message: 'Error al cargar la categoría' });
  }
}
