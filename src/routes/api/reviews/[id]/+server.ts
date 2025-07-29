import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { RequestHandler } from './$types';

// GET: Obtener una reseña específica
export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { id } = params;
		
		if (!id) {
			return json({ error: 'ID de reseña es requerido' }, { status: 400 });
		}

		const { data: review, error } = await supabaseAdmin
			.from('reviews')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return json({ error: 'Reseña no encontrada' }, { status: 404 });
			}
			console.error('Error fetching review:', error);
			return json({ error: 'Error al obtener la reseña' }, { status: 500 });
		}

		// Obtener datos del reviewer
		const { data: customer, error: customerError } = await supabaseAdmin
			.from('customers')
			.select('user_id, first_name, last_name, profile_image_url')
			.eq('user_id', review.reviewer_user_id)
			.single();

		if (customerError) {
			console.error('Error fetching customer data:', customerError);
		}

		const reviewWithCustomer = {
			...review,
			reviewer: customer || null
		};

		return json({ 
			success: true, 
			data: { review: reviewWithCustomer } 
		});

	} catch (error) {
		console.error('Error in GET /api/reviews/[id]:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
};

// PUT: Editar una reseña
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		
		if (!session?.user) {
			return json({ error: 'No autorizado' }, { status: 401 });
		}

		const { id } = params;
		const { rating, comment } = await request.json();

		if (!id) {
			return json({ error: 'ID de reseña es requerido' }, { status: 400 });
		}

		// Validaciones
		if (!rating || rating < 1 || rating > 5) {
			return json({ error: 'rating debe estar entre 1 y 5' }, { status: 400 });
		}

		if (!comment || comment.trim().length < 10) {
			return json({ error: 'comment debe tener al menos 10 caracteres' }, { status: 400 });
		}

		// Verificar que la reseña existe y pertenece al usuario
		const { data: existingReview, error: existingError } = await supabaseAdmin
			.from('reviews')
			.select('id, provider_profile_id, reviewer_user_id')
			.eq('id', id)
			.single();

		if (existingError) {
			if (existingError.code === 'PGRST116') {
				return json({ error: 'Reseña no encontrada' }, { status: 404 });
			}
			console.error('Error fetching existing review:', existingError);
			return json({ error: 'Error al verificar la reseña' }, { status: 500 });
		}

		// Verificar que el usuario es el autor de la reseña
		if (existingReview.reviewer_user_id !== user.id) {
			return json({ error: 'No tienes permisos para editar esta reseña' }, { status: 403 });
		}

		// Actualizar la reseña
		const { data: updatedReview, error: updateError } = await supabaseAdmin
			.from('reviews')
			.update({
				rating: rating,
				comment: comment.trim(),
				updated_at: new Date().toISOString()
			})
			.eq('id', id)
			.select('*')
			.single();

		if (updateError) {
			console.error('Error updating review:', updateError);
			return json({ error: 'Error al actualizar la reseña' }, { status: 500 });
		}

		// Obtener datos del reviewer
		const { data: customer, error: customerError } = await supabaseAdmin
			.from('customers')
			.select('user_id, first_name, last_name, profile_image_url')
			.eq('user_id', user.id)
			.single();

		if (customerError) {
			console.error('Error fetching customer data:', customerError);
		}

		const reviewWithCustomer = {
			...updatedReview,
			reviewer: customer || null
		};

		// Actualizar estadísticas del proveedor
		await updateProviderStats(existingReview.provider_profile_id);

		return json({ 
			success: true, 
			data: { review: reviewWithCustomer },
			message: 'Reseña actualizada exitosamente'
		});

	} catch (error) {
		console.error('Error in PUT /api/reviews/[id]:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
};

// DELETE: Eliminar una reseña
export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		
		if (!session || !user) {
			return json({ error: 'No autorizado' }, { status: 401 });
		}

		const { id } = params;

		if (!id) {
			return json({ error: 'ID de reseña es requerido' }, { status: 400 });
		}

		// Verificar que la reseña existe y pertenece al usuario
		const { data: existingReview, error: existingError } = await supabaseAdmin
			.from('reviews')
			.select('id, provider_profile_id, reviewer_user_id')
			.eq('id', id)
			.single();

		if (existingError) {
			if (existingError.code === 'PGRST116') {
				return json({ error: 'Reseña no encontrada' }, { status: 404 });
			}
			console.error('Error fetching existing review:', existingError);
			return json({ error: 'Error al verificar la reseña' }, { status: 500 });
		}

		// Verificar que el usuario es el autor de la reseña
		if (existingReview.reviewer_user_id !== user.id) {
			return json({ error: 'No tienes permisos para eliminar esta reseña' }, { status: 403 });
		}

		// Eliminar la reseña
		const { error: deleteError } = await supabaseAdmin
			.from('reviews')
			.delete()
			.eq('id', id);

		if (deleteError) {
			console.error('Error deleting review:', deleteError);
			return json({ error: 'Error al eliminar la reseña' }, { status: 500 });
		}

		// Actualizar estadísticas del proveedor
		await updateProviderStats(existingReview.provider_profile_id);

		return json({ 
			success: true,
			message: 'Reseña eliminada exitosamente'
		});

	} catch (error) {
		console.error('Error in DELETE /api/reviews/[id]:', error);
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