import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const category = url.searchParams.get('category') || 'assembly';
        
        // Mapeo de categorías
        const categoryIdMapping: { [key: string]: number } = {
            'mounting': 2, // Montaje
            'cleaning': 4, // Limpieza
            'gardening': 5, // Jardinería
            'moving': 3, // Mudanzas
            'assembly': 1  // Ensamblaje
        };

        const categoryId = categoryIdMapping[category];
        if (!categoryId) {
            return json({
                success: false,
                error: `Category '${category}' not found`,
                availableCategories: Object.keys(categoryIdMapping)
            });
        }

        console.log(`🔍 Testing category: ${category} (ID: ${categoryId})`);

        // Hacer la petición al endpoint de providers
        const baseUrl = url.origin;
        const providersUrl = `${baseUrl}/api/providers?category_id=${categoryId}&limit=50`;
        
        console.log(`📡 Fetching: ${providersUrl}`);
        
        const response = await fetch(providersUrl);
        const result = await response.json();

        console.log(`📊 Response status: ${response.status}`);
        console.log(`📋 Result:`, result);

        if (!response.ok) {
            return json({
                success: false,
                error: 'Failed to fetch providers',
                details: result,
                url: providersUrl
            });
        }

        // Simular filtros de precio
        const priceRange = [10, 3000];
        let filteredProviders = result.data.providers.filter((provider: any) => {
            return provider.hourly_rate >= priceRange[0] && provider.hourly_rate <= priceRange[1];
        });

        return json({
            success: true,
            category,
            categoryId,
            url: providersUrl,
            originalCount: result.data.providers.length,
            filteredCount: filteredProviders.length,
            priceRange,
            providers: filteredProviders,
            rawResult: result
        });

    } catch (error) {
        console.error('❌ Error in test endpoint:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}; 