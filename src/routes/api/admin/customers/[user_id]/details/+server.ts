import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '$lib/env-utils';

// Get environment variables with fallbacks
const SUPABASE_URL = getSupabaseUrl();
const SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

// Función helper para hacer queries directas con fetch
async function directSupabaseQuery(endpoint: string, options: any = {}) {
	const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
	const response = await fetch(url, {
		headers: {
			'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
			'apikey': SERVICE_ROLE_KEY,
			'Content-Type': 'application/json',
			'Prefer': 'return=representation',
			...options.headers
		},
		...options
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('Supabase query failed:', response.status, response.statusText, errorText);
		throw new Error(`Supabase query failed: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	try {
		// Verificar autenticación y rol de admin
		const { data: { session } } = await locals.supabase.auth.getSession();
		if (!session) {
			return json({ error: 'No autorizado' }, { status: 401 });
		}

		const { user_id } = params;
		if (!user_id) {
			return json({ error: 'ID de usuario requerido' }, { status: 400 });
		}

		console.log('Fetching customer details for user_id:', user_id);

		// Obtener detalles del cliente usando query directa
		const customerData = await directSupabaseQuery(`customers?user_id=eq.${user_id}`);

		if (!customerData || customerData.length === 0) {
			return json({ error: 'Cliente no encontrado' }, { status: 404 });
		}

		const customer = customerData[0];

		// Obtener estadísticas adicionales de reservas
		let bookingsData = [];
		try {
			bookingsData = await directSupabaseQuery(`bookings?client_user_id=eq.${user_id}&select=id,status,total_price,created_at`);
		} catch (bookingsError) {
			console.error('Error fetching bookings:', bookingsError);
		}

		// Obtener reseñas del cliente
		let reviewsData = [];
		try {
			reviewsData = await directSupabaseQuery(`reviews?reviewer_user_id=eq.${user_id}&select=id,rating,created_at`);
		} catch (reviewsError) {
			console.error('Error fetching reviews:', reviewsError);
		}

		// Calcular estadísticas
		const totalBookings = bookingsData?.length || 0;
		const completedBookings = bookingsData?.filter((b: any) => b.status === 'completed').length || 0;
		const totalReviews = reviewsData?.length || 0;
		const totalSpent = bookingsData
			?.filter((b: any) => b.status === 'completed')
			.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0) || 0;
		
		const avgRating = reviewsData && reviewsData.length > 0
			? (reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsData.length).toFixed(1)
			: null;

		// Preparar respuesta con detalles completos
		const customerDetails = {
			// Información básica del cliente
			user_id: customer.user_id,
			first_name: customer.first_name,
			last_name: customer.last_name,
			phone_number: customer.phone_number,
			email: customer.email || 'Email no disponible',
			created_at: customer.created_at,
			updated_at: customer.updated_at,
			
			// Estadísticas
			total_bookings: totalBookings,
			completed_bookings: completedBookings,
			pending_bookings: bookingsData?.filter((b: any) => b.status === 'pending_confirmation').length || 0,
			cancelled_bookings: bookingsData?.filter((b: any) => b.status === 'cancelled_by_client' || b.status === 'cancelled_by_provider').length || 0,
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