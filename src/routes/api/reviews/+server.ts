import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { RequestHandler } from './$types';

// GET: Obtener reseñas de un proveedor
export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const providerId = url.searchParams.get('provider_id');
		
		if (!providerId) {
			return json({ error: 'provider_id es requerido' }, { status: 400 });
		}

		// Primero obtener las reseñas
		const { data: reviews, error } = await supabaseAdmin
			.from('reviews')
			.select('*')
			.eq('provider_profile_id', providerId)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching reviews:', error);
			return json({ error: 'Error al obtener las reseñas' }, { status: 500 });
		}

		// Luego obtener los datos de los usuarios que hicieron las reseñas
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

			// Agregar datos del reviewer a cada reseña
			reviews.forEach(review => {
				const customer = customerMap.get(review.reviewer_user_id);
				review.reviewer = customer || null;
			});
		}

		if (error) {
			console.error('Error fetching reviews:', error);
			return json({ error: 'Error al obtener las reseñas' }, { status: 500 });
		}

		return json({ 
			success: true, 
			data: { reviews: reviews || [] } 
		});

	} catch (error) {
		console.error('Error in GET /api/reviews:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
};

// POST: Crear una nueva reseña
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const session = await locals.getSession();
		
		if (!session?.user) {
			return json({ error: 'No autorizado' }, { status: 401 });
		}

		const { provider_id, rating, comment } = await request.json();

		// Validaciones
		if (!provider_id) {
			return json({ error: 'provider_id es requerido' }, { status: 400 });
		}

		if (!rating || rating < 1 || rating > 5) {
			return json({ error: 'rating debe estar entre 1 y 5' }, { status: 400 });
		}

		if (!comment || comment.trim().length < 10) {
			return json({ error: 'comment debe tener al menos 10 caracteres' }, { status: 400 });
		}

		// Verificar que el proveedor existe
		const { data: provider, error: providerError } = await supabaseAdmin
			.from('provider_profiles')
			.select('id, business_name')
			.eq('id', provider_id)
			.single();

		if (providerError || !provider) {
			return json({ error: 'Proveedor no encontrado' }, { status: 404 });
		}

		// Verificar que el usuario tenga un perfil de customer
		const { data: customerProfile, error: customerProfileError } = await supabaseAdmin
			.from('customers')
			.select('id, first_name, last_name')
			.eq('user_id', session.user.id)
			.single();

		if (customerProfileError || !customerProfile) {
			return json({ error: 'Debes tener un perfil de cliente para poder comentar' }, { status: 400 });
		}

		// Permitir múltiples reseñas por usuario (comentado para permitir múltiples reseñas)
		// const { data: existingReview, error: existingError } = await supabaseAdmin
		// 	.from('reviews')
		// 	.select('id')
		// 	.eq('provider_profile_id', provider_id)
		// 	.eq('reviewer_user_id', session.user.id)
		// 	.single();

		// if (existingReview) {
		// 	return json({ error: 'Ya has dejado una reseña para este proveedor' }, { status: 400 });
		// }

		// Crear la reseña (sin booking_id por ahora)
		const { data: newReview, error: insertError } = await supabaseAdmin
			.from('reviews')
			.insert({
				provider_profile_id: provider_id,
				reviewer_user_id: session.user.id,
				rating: rating,
				comment: comment.trim(),
				booking_id: null // Permitir reseñas sin reserva
			})
			.select('*')
			.single();

		// Obtener los datos del customer que creó la reseña
		const { data: customer, error: customerError } = await supabaseAdmin
			.from('customers')
			.select('user_id, first_name, last_name, profile_image_url')
			.eq('user_id', session.user.id)
			.single();

		if (customerError) {
			console.error('Error fetching customer data:', customerError);
		}

		// Combinar los datos
		const reviewWithCustomer = {
			...newReview,
			reviewer: customer || null
		};

		// Actualizar estadísticas del proveedor
		await updateProviderStats(provider_id);

		return json({ 
			success: true, 
			data: { review: reviewWithCustomer },
			message: 'Reseña creada exitosamente'
		});

	} catch (error) {
		console.error('Error in POST /api/reviews:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
};

// Función para actualizar estadísticas del proveedor
async function updateProviderStats(providerId: string) {
	try {
		// Obtener todas las reseñas del proveedor
		const { data: reviews, error } = await supabaseAdmin
			.from('reviews')
			.select('rating')
			.eq('provider_profile_id', providerId);

		if (error || !reviews) return;

		// Calcular promedio y total
		const totalReviews = reviews.length;
		const averageRating = totalReviews > 0 
			? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / totalReviews 
			: 0;

		// Actualizar el perfil del proveedor
		await supabaseAdmin
			.from('provider_profiles')
			.update({
				average_rating: Math.round(averageRating * 100) / 100,
				total_reviews: totalReviews
			})
			.eq('id', providerId);

	} catch (error) {
		console.error('Error updating provider stats:', error);
	}
} 