import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase-server';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	try {
		// Verificar autenticación y rol de admin
		const session = await locals.getSession();
		if (!session) {
			return json({ error: 'No autorizado' }, { status: 401 });
		}

		const { user_id } = params;
		if (!user_id) {
			return json({ error: 'ID de usuario requerido' }, { status: 400 });
		}

		// Crear cliente de Supabase
		const supabase = createSupabaseAdminClient(fetch);

		// Obtener detalles del cliente usando la vista completa
		const { data: customerData, error: customerError } = await supabase
			.from('admin_customers_complete')
			.select('*')
			.eq('user_id', user_id)
			.single();

		if (customerError) {
			console.error('Error fetching customer details:', customerError);
			return json({ error: 'Error al obtener detalles del cliente' }, { status: 500 });
		}

		if (!customerData) {
			return json({ error: 'Cliente no encontrado' }, { status: 404 });
		}

		// Obtener estadísticas adicionales de reservas
		const { data: bookingsData, error: bookingsError } = await supabase
			.from('bookings')
			.select('id, status, total_amount, created_at')
			.eq('customer_id', user_id);

		if (bookingsError) {
			console.error('Error fetching bookings:', bookingsError);
		}

		// Obtener reseñas del cliente
		const { data: reviewsData, error: reviewsError } = await supabase
			.from('reviews')
			.select('id, rating, created_at')
			.eq('customer_id', user_id);

		if (reviewsError) {
			console.error('Error fetching reviews:', reviewsError);
		}

		// Calcular estadísticas
		const totalBookings = bookingsData?.length || 0;
		const completedBookings = bookingsData?.filter((b: any) => b.status === 'completed').length || 0;
		const totalReviews = reviewsData?.length || 0;
		const totalSpent = bookingsData
			?.filter((b: any) => b.status === 'completed')
			.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;
		
		const avgRating = reviewsData && reviewsData.length > 0
			? (reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsData.length).toFixed(1)
			: null;

		// Preparar respuesta con detalles completos
		const customerDetails = {
			// Información básica del cliente
			user_id: customerData.user_id,
			first_name: customerData.first_name,
			last_name: customerData.last_name,
			phone_number: customerData.phone_number,
			email: customerData.user_email,
			created_at: customerData.created_at,
			updated_at: customerData.updated_at,
			
			// Estadísticas
			total_bookings: totalBookings,
			completed_bookings: completedBookings,
			pending_bookings: bookingsData?.filter((b: any) => b.status === 'pending').length || 0,
			cancelled_bookings: bookingsData?.filter((b: any) => b.status === 'cancelled').length || 0,
			total_reviews: totalReviews,
			avg_rating: avgRating,
			total_spent: totalSpent,
			
			// Información adicional
			last_booking: bookingsData && bookingsData.length > 0 
				? bookingsData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
				: null,
			last_review: reviewsData && reviewsData.length > 0
				? reviewsData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
				: null
		};

		return json(customerDetails);

	} catch (error) {
		console.error('Error in customer details endpoint:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}; 