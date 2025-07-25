import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const results: any = {
		timestamp: new Date().toISOString(),
		relationships: {
			provider_profiles: 'pending',
			services: 'pending',
			provider_categories: 'pending'
		},
		errors: [] as string[],
		data: {}
	};

	try {
		// Test 1: Check provider_profiles table structure
		try {
			const { data: providers, error } = await supabaseAdmin
				.from('provider_profiles')
				.select('*')
				.limit(1);

			if (error) {
				results.relationships.provider_profiles = 'error';
				results.errors.push(`Provider profiles error: ${error.message}`);
			} else {
				results.relationships.provider_profiles = 'success';
				results.data.provider_profiles = providers?.[0] || null;
			}
		} catch (error) {
			results.relationships.provider_profiles = 'error';
			results.errors.push(`Provider profiles exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}

		// Test 2: Check services table structure
		try {
			const { data: services, error } = await supabaseAdmin
				.from('services')
				.select('*')
				.limit(1);

			if (error) {
				results.relationships.services = 'error';
				results.errors.push(`Services error: ${error.message}`);
			} else {
				results.relationships.services = 'success';
				results.data.services = services?.[0] || null;
			}
		} catch (error) {
			results.relationships.services = 'error';
			results.errors.push(`Services exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}

		// Test 3: Check provider_categories table structure
		try {
			const { data: providerCategories, error } = await supabaseAdmin
				.from('provider_categories')
				.select('*')
				.limit(1);

			if (error) {
				results.relationships.provider_categories = 'error';
				results.errors.push(`Provider categories error: ${error.message}`);
			} else {
				results.relationships.provider_categories = 'success';
				results.data.provider_categories = providerCategories?.[0] || null;
			}
		} catch (error) {
			results.relationships.provider_categories = 'error';
			results.errors.push(`Provider categories exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}

		// Test 4: Try to get user emails from auth
		try {
			const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
			if (error) {
				results.errors.push(`Auth users error: ${error.message}`);
			} else {
				results.data.auth_users_count = users?.users?.length || 0;
			}
		} catch (error) {
			results.errors.push(`Auth users exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}

	} catch (error) {
		console.error('❌ Error in relationships test:', error);
		results.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}

	return json(results);
}; 