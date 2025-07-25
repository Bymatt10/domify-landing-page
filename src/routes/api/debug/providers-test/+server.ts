import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const category = url.searchParams.get('category') || 'jardineria';
	const results: any = {
		timestamp: new Date().toISOString(),
		category: category,
		tests: {
			direct_query: 'pending',
			supabase_client: 'pending',
			category_mapping: 'pending',
			provider_filtering: 'pending'
		},
		errors: [] as string[],
		data: null
	};

	try {
		console.log('🔍 Testing providers API for category:', category);

		// Test 1: Direct Supabase query (como lo hace el endpoint actual)
		try {
			const { data: categories, error: catError } = await supabaseAdmin
				.from('categories')
				.select('id, name, slug')
				.eq('slug', category);

			if (catError) {
				results.tests.direct_query = 'error';
				results.errors.push(`Category query error: ${catError.message}`);
			} else if (categories && categories.length > 0) {
				results.tests.direct_query = 'success';
				console.log('✅ Category found:', categories[0]);
				
				const categoryId = categories[0].id;
				
				// Test 2: Get providers for this category
				const { data: categoryProviders, error: cpError } = await supabaseAdmin
					.from('provider_categories')
					.select('provider_profile_id')
					.eq('category_id', categoryId);

				if (cpError) {
					results.tests.provider_filtering = 'error';
					results.errors.push(`Provider categories error: ${cpError.message}`);
				} else {
					results.tests.provider_filtering = 'success';
					console.log('✅ Found provider categories:', categoryProviders?.length || 0);

					if (categoryProviders && categoryProviders.length > 0) {
						const providerIds = categoryProviders.map(cp => cp.provider_profile_id);
						
						// Test 3: Get actual provider profiles
						const { data: providers, error: provError } = await supabaseAdmin
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
								settings
							`)
							.in('id', providerIds)
							.eq('is_active', true);

						if (provError) {
							results.tests.supabase_client = 'error';
							results.errors.push(`Provider profiles error: ${provError.message}`);
						} else {
							results.tests.supabase_client = 'success';
							results.data = providers;
							console.log('✅ Found providers:', providers?.length || 0);
						}
					} else {
						results.tests.supabase_client = 'success';
						results.data = [];
						console.log('✅ No providers found for category');
					}
				}
			} else {
				results.tests.direct_query = 'error';
				results.errors.push(`Category '${category}' not found`);
			}
		} catch (error) {
			results.tests.direct_query = 'error';
			results.errors.push(`Direct query exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}

		// Test 4: Test the actual API endpoint
		try {
			const apiResponse = await fetch(`https://domify.app/api/providers?category=${category}`);
			if (apiResponse.ok) {
				const apiData = await apiResponse.json();
				results.tests.category_mapping = 'success';
				console.log('✅ API endpoint working, returned:', apiData.data?.providers?.length || 0, 'providers');
			} else {
				results.tests.category_mapping = 'error';
				results.errors.push(`API endpoint failed: ${apiResponse.status} ${apiResponse.statusText}`);
			}
		} catch (error) {
			results.tests.category_mapping = 'error';
			results.errors.push(`API endpoint exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}

	} catch (error) {
		console.error('❌ Error in providers test:', error);
		results.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}

	return json(results);
}; 