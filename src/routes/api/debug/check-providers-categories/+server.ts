import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';

// Get environment variables with fallbacks
const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();
const SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

// Función helper para hacer queries directas con fetch
async function directSupabaseQuery(endpoint: string, options: any = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase query failed:', response.status, response.statusText, errorText);
    throw new Error(`Supabase query failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const GET: RequestHandler = async () => {
    try {
        console.log('🔍 Checking providers and categories...');

        // 1. Obtener todos los proveedores
        const providers = await directSupabaseQuery('provider_profiles?select=*');
        console.log(`📊 Found ${providers.length} providers:`, providers);

        // 2. Obtener todas las categorías
        const categories = await directSupabaseQuery('categories?select=*');
        console.log(`📋 Found ${categories.length} categories:`, categories);

        // 3. Obtener relaciones provider_categories
        const providerCategories = await directSupabaseQuery('provider_categories?select=*');
        console.log(`🔗 Found ${providerCategories.length} provider-category relationships:`, providerCategories);

        // 4. Obtener servicios
        const services = await directSupabaseQuery('services?select=*');
        console.log(`⚙️ Found ${services.length} services:`, services);

        // 5. Verificar si existe la tabla provider_categories
        try {
            const tableCheck = await directSupabaseQuery('provider_categories?limit=1');
            console.log('✅ provider_categories table exists');
        } catch (error) {
            console.log('❌ provider_categories table does not exist or is empty');
        }

        // 6. Para cada proveedor, intentar obtener sus categorías
        const providersWithCategories = await Promise.all(
            providers.map(async (provider: any) => {
                try {
                    const providerCats = await directSupabaseQuery(
                        `provider_categories?provider_profile_id=eq.${provider.id}&select=*,categories(*)`
                    );
                    return {
                        ...provider,
                        categories: providerCats
                    };
                } catch (error) {
                    return {
                        ...provider,
                        categories: [],
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            })
        );

        return json({
            success: true,
            data: {
                providers: providersWithCategories,
                categories,
                providerCategories,
                services,
                summary: {
                    totalProviders: providers.length,
                    totalCategories: categories.length,
                    totalRelationships: providerCategories.length,
                    totalServices: services.length
                }
            },
            message: 'Debug info retrieved successfully'
        });

    } catch (error) {
        console.error('❌ Error in debug endpoint:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to retrieve debug info'
        }, { status: 500 });
    }
}; 