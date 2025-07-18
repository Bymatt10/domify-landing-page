import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const providerId = url.searchParams.get('provider_id');
		
		if (!providerId) {
			return json({ error: 'provider_id es requerido' }, { status: 400 });
		}

		// Verificar que el proveedor existe
		const { data: provider, error: providerError } = await supabaseAdmin
			.from('provider_profiles')
			.select('id, business_name')
			.eq('id', providerId)
			.single();

		if (providerError || !provider) {
			return json({ error: 'Proveedor no encontrado' }, { status: 404 });
		}

		// Obtener reseñas
		const { data: reviews, error: reviewsError } = await supabaseAdmin
			.from('reviews')
			.select('*')
			.eq('provider_profile_id', providerId)
			.order('created_at', { ascending: false });

		if (reviewsError) {
			return json({ error: 'Error al obtener reseñas', details: reviewsError }, { status: 500 });
		}

		// Obtener datos de customers si hay reseñas
		let reviewsWithCustomers = reviews || [];
		if (reviews && reviews.length > 0) {
			const userIds = [...new Set(reviews.map(review => review.reviewer_user_id))];
			
			const { data: customers, error: customersError } = await supabaseAdmin
				.from('customers')
				.select('user_id, first_name, last_name, profile_image_url')
				.in('user_id', userIds);

			if (customersError) {
				console.error('Error fetching customers:', customersError);
			}

			// Combinar los datos
			const customerMap = new Map();
			if (customers) {
				customers.forEach(customer => {
					customerMap.set(customer.user_id, customer);
				});
			}

			reviewsWithCustomers = reviews.map(review => ({
				...review,
				reviewer: customerMap.get(review.reviewer_user_id) || null
			}));
		}

		return json({
			success: true,
			data: {
				provider,
				reviews: reviewsWithCustomers,
				totalReviews: reviewsWithCustomers.length
			}
		});

	} catch (error) {
		console.error('Error in test-reviews:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}; 