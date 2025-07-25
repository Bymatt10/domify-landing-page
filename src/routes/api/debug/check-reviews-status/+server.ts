import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const providerId = url.searchParams.get('provider_id');
		
		console.log('🔍 Checking reviews status for provider:', providerId);

		// 1. Verificar si la tabla reviews existe
		const { data: tableInfo, error: tableError } = await supabaseAdmin
			.from('reviews')
			.select('*')
			.limit(1);

		if (tableError) {
			console.error('❌ Table error:', tableError);
			return json({
				error: 'Error accessing reviews table',
				details: tableError,
				step: 'table_check'
			}, { status: 500 });
		}

		console.log('✅ Reviews table exists');

		// 2. Si se proporciona provider_id, verificar reseñas específicas
		if (providerId) {
			const { data: reviews, error: reviewsError } = await supabaseAdmin
				.from('reviews')
				.select('*')
				.eq('provider_profile_id', providerId);

			if (reviewsError) {
				console.error('❌ Reviews fetch error:', reviewsError);
				return json({
					error: 'Error fetching reviews for provider',
					details: reviewsError,
					provider_id: providerId,
					step: 'reviews_fetch'
				}, { status: 500 });
			}

			console.log('✅ Found reviews for provider:', reviews?.length || 0);

			// 3. Verificar si hay reseñas con reviewer_user_id
			if (reviews && reviews.length > 0) {
				const reviewsWithReviewer = reviews.filter(r => r.reviewer_user_id);
				console.log('📊 Reviews with reviewer_user_id:', reviewsWithReviewer.length);

				// 4. Intentar obtener datos de customers
				const userIds = [...new Set(reviewsWithReviewer.map(r => r.reviewer_user_id))];
				console.log('👥 Unique user IDs:', userIds);

				if (userIds.length > 0) {
					const { data: customers, error: customersError } = await supabaseAdmin
						.from('customers')
						.select('user_id, first_name, last_name, profile_image_url')
						.in('user_id', userIds);

					if (customersError) {
						console.error('❌ Customers fetch error:', customersError);
						return json({
							error: 'Error fetching customer data',
							details: customersError,
							user_ids: userIds,
							step: 'customers_fetch'
						}, { status: 500 });
					}

					console.log('✅ Found customers:', customers?.length || 0);
				}
			}

			return json({
				success: true,
				provider_id: providerId,
				reviews_count: reviews?.length || 0,
				reviews_with_reviewer: reviews?.filter(r => r.reviewer_user_id).length || 0,
				sample_review: reviews?.[0] || null
			});
		}

		// 3. Obtener estadísticas generales de la tabla
		const { count: totalReviews } = await supabaseAdmin
			.from('reviews')
			.select('*', { count: 'exact', head: true });

		const { count: reviewsWithReviewer } = await supabaseAdmin
			.from('reviews')
			.select('*', { count: 'exact', head: true })
			.not('reviewer_user_id', 'is', null);

		return json({
			success: true,
			table_status: 'exists',
			total_reviews: totalReviews,
			reviews_with_reviewer: reviewsWithReviewer,
			message: 'Reviews table is accessible'
		});

	} catch (error) {
		console.error('❌ Unexpected error:', error);
		return json({
			error: 'Unexpected error occurred',
			details: error instanceof Error ? error.message : 'Unknown error',
			step: 'unexpected'
		}, { status: 500 });
	}
}; 