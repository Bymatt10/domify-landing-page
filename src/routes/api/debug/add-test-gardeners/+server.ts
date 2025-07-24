import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl, getSupabaseAnonKey } from '$lib/env-utils';

export const POST: RequestHandler = async () => {
    try {
        const supabaseUrl = getSupabaseUrl();
        const supabaseAnonKey = getSupabaseAnonKey();

        // First, get the gardening category ID
        const categoryResponse = await fetch(`${supabaseUrl}/rest/v1/categories?slug=eq.jardineria&select=id`, {
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
            }
        });

        if (!categoryResponse.ok) {
            throw new Error('Failed to fetch gardening category');
        }

        const categories = await categoryResponse.json();
        if (!categories || categories.length === 0) {
            throw new Error('Gardening category not found');
        }

        const gardeningCategoryId = categories[0].id;

        // Get some existing providers to assign to gardening
        const providersResponse = await fetch(`${supabaseUrl}/rest/v1/provider_profiles?is_active=eq.true&select=id&limit=3`, {
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
            }
        });

        if (!providersResponse.ok) {
            throw new Error('Failed to fetch providers');
        }

        const providers = await providersResponse.json();
        if (!providers || providers.length === 0) {
            throw new Error('No active providers found');
        }

        // Add providers to gardening category
        const assignments = providers.map((provider: any) => ({
            provider_profile_id: provider.id,
            category_id: gardeningCategoryId
        }));

        // Insert the assignments
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/provider_categories`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(assignments)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Failed to insert provider categories: ${errorText}`);
        }

        const insertedData = await insertResponse.json();

        return json({
            data: {
                gardening_category_id: gardeningCategoryId,
                providers_assigned: providers.map((p: any) => p.id),
                assignments_created: insertedData,
                message: `Successfully assigned ${providers.length} providers to gardening category`
            },
            message: 'Test gardeners added successfully',
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