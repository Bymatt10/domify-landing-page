import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const category = url.searchParams.get('category') || 'jardineria';
	const results: any = {
		timestamp: new Date().toISOString(),
		category: category,
		tests: {
			server_load: 'pending',
			providers_fetch: 'pending',
			services_fetch: 'pending',
			category_fetch: 'pending'
		},
		errors: [] as string[],
		data: null
	};

	try {
		console.log('🔍 Testing services page server load for category:', category);

		// Test 1: Server-side load (like +page.server.ts)
		try {
			// Cargar proveedores de la categoría
			const { data: providers, error: providersError } = await supabaseAdmin
				.from('provider_profiles')
				.select(`
					id,
					business_name,
					bio,
					hourly_rate,
					average_rating,
					portfolio,
					location,
					phone,
					total_reviews,
					provider_type,
					user_id,
					settings,
					users (
						id,
						email,
						role
					),
					provider_categories (
						category_id,
						categories (
							id,
							name,
							slug
						)
					)
				`)
				.eq('provider_categories.categories.slug', category)
				.order('average_rating', { ascending: false });

			if (providersError) {
				results.tests.providers_fetch = 'error';
				results.errors.push(`Providers fetch error: ${providersError.message}`);
			} else {
				results.tests.providers_fetch = 'success';
				console.log('✅ Found providers:', providers?.length || 0);
			}

			// Cargar servicios de la categoría
			const { data: services, error: servicesError } = await supabaseAdmin
				.from('services')
				.select(`
					id,
					title,
					description,
					price,
					provider_profile_id,
					provider_profiles (
						id,
						business_name
					)
				`)
				.eq('categories.slug', category)
				.order('created_at', { ascending: false });

			if (servicesError) {
				results.tests.services_fetch = 'error';
				results.errors.push(`Services fetch error: ${servicesError.message}`);
			} else {
				results.tests.services_fetch = 'success';
				console.log('✅ Found services:', services?.length || 0);
			}

			// Cargar información de la categoría
			const { data: categoryInfo, error: categoryError } = await supabaseAdmin
				.from('categories')
				.select('id, name, description, icon, slug')
				.eq('slug', category)
				.single();

			if (categoryError) {
				results.tests.category_fetch = 'error';
				results.errors.push(`Category fetch error: ${categoryError.message}`);
			} else {
				results.tests.category_fetch = 'success';
				console.log('✅ Found category:', categoryInfo);
			}

			results.tests.server_load = 'success';
			results.data = {
				category: categoryInfo || { name: category, description: 'Servicios profesionales' },
				providers: providers || [],
				services: services || [],
				preloaded: true
			};

		} catch (error) {
			results.tests.server_load = 'error';
			results.errors.push(`Server load exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}

	} catch (error) {
		console.error('❌ Error in services page test:', error);
		results.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}

	return json(results);
}; 