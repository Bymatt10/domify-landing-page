import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl, getSupabaseAnonKey } from '$lib/env-utils';

export const GET: RequestHandler = async () => {
    try {
        const supabaseUrl = getSupabaseUrl();
        const supabaseAnonKey = getSupabaseAnonKey();

        // Check provider_categories table
        const providerCategoriesResponse = await fetch(`${supabaseUrl}/rest/v1/provider_categories?select=*&limit=10`, {
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
            }
        });

        let providerCategories = [];
        let providerCategoriesError = null;
        
        if (providerCategoriesResponse.ok) {
            providerCategories = await providerCategoriesResponse.json();
        } else {
            providerCategoriesError = await providerCategoriesResponse.text();
        }

        // Check active providers
        const providersResponse = await fetch(`${supabaseUrl}/rest/v1/provider_profiles?is_active=eq.true&select=id,business_name,headline,provider_type&limit=10`, {
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
            }
        });

        let providers = [];
        let providersError = null;
        
        if (providersResponse.ok) {
            providers = await providersResponse.json();
        } else {
            providersError = await providersResponse.text();
        }

        // Check categories
        const categoriesResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name,slug&limit=10`, {
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
            }
        });

        let categories = [];
        let categoriesError = null;
        
        if (categoriesResponse.ok) {
            categories = await categoriesResponse.json();
        } else {
            categoriesError = await categoriesResponse.text();
        }

        return json({
            data: {
                provider_categories: {
                    total: providerCategories.length,
                    data: providerCategories,
                    error: providerCategoriesError
                },
                providers: {
                    total: providers.length,
                    data: providers,
                    error: providersError
                },
                categories: {
                    total: categories.length,
                    data: categories,
                    error: categoriesError
                },
                analysis: {
                    has_provider_categories: providerCategories.length > 0,
                    has_active_providers: providers.length > 0,
                    has_categories: categories.length > 0,
                    providers_without_categories: providers.length - providerCategories.length
                }
            },
            message: 'Provider categories table analysis',
            statusCode: 200,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return json({
            error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        }, { status: 500 });
    }
}; 