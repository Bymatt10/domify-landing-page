import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl, getSupabaseAnonKey } from '$lib/env-utils';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const categorySlug = url.searchParams.get('category');
        if (!categorySlug) {
            return json({
                error: {
                    message: 'Category parameter is required',
                    statusCode: 400,
                    timestamp: new Date().toISOString()
                }
            }, { status: 400 });
        }

        const supabaseUrl = getSupabaseUrl();
        const supabaseAnonKey = getSupabaseAnonKey();

        // Get category ID from slug
        const categoryResponse = await fetch(`${supabaseUrl}/rest/v1/categories?slug=eq.${categorySlug}&select=id,name`, {
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
            }
        });

        if (!categoryResponse.ok) {
            throw new Error(`Failed to fetch category: ${categoryResponse.status}`);
        }

        const categories = await categoryResponse.json();
        if (!categories || categories.length === 0) {
            return json({
                data: {
                    category: null,
                    providers: [],
                    message: `Category '${categorySlug}' not found`
                },
                statusCode: 404,
                timestamp: new Date().toISOString()
            });
        }

        const category = categories[0];

        // Get providers in this category
        const providersResponse = await fetch(`${supabaseUrl}/rest/v1/provider_categories?category_id=eq.${category.id}&select=provider_profile_id`, {
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
            }
        });

        if (!providersResponse.ok) {
            throw new Error(`Failed to fetch providers: ${providersResponse.status}`);
        }

        const providerCategories = await providersResponse.json();
        
        // Get provider details
        let providers = [];
        if (providerCategories && providerCategories.length > 0) {
            const providerIds = providerCategories.map((pc: any) => pc.provider_profile_id);
            const providerIdsString = providerIds.map((id: string) => `id=eq.${id}`).join('&or=');
            
            const providerDetailsResponse = await fetch(`${supabaseUrl}/rest/v1/provider_profiles?${providerIdsString}&is_active=eq.true`, {
                headers: {
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'apikey': supabaseAnonKey,
                    'Content-Type': 'application/json'
                }
            });

            if (providerDetailsResponse.ok) {
                providers = await providerDetailsResponse.json();
            }
        }

        return json({
            data: {
                category: {
                    id: category.id,
                    name: category.name,
                    slug: categorySlug
                },
                providers: providers.map((provider: any) => ({
                    id: provider.id,
                    business_name: provider.business_name || provider.headline || 'Sin nombre',
                    is_active: provider.is_active,
                    provider_type: provider.provider_type,
                    location: provider.location
                })),
                total_providers: providers.length
            },
            message: `Providers found for category '${categorySlug}'`,
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