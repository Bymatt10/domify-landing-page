import { error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const category = params.category;
	
	if (!category) {
		throw error(404, 'Categoría no encontrada');
	}

	try {
		// Cargar proveedores de la categoría
		const { data: providers, error: providersError } = await supabaseAdmin
			.from('provider_profiles')
			.select(`
				id,
				business_name,
				description,
				hourly_rate,
				rating,
				photo_url,
				location,
				phone,
				total_reviews,
				provider_type,
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
			.order('rating', { ascending: false });

		if (providersError) {
			console.error('Error loading providers:', providersError);
			throw error(500, 'Error al cargar proveedores');
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
			console.error('Error loading services:', servicesError);
			// No lanzar error aquí, solo log
		}

		// Cargar información de la categoría
		const { data: categoryInfo, error: categoryError } = await supabaseAdmin
			.from('categories')
			.select('id, name, description, icon, slug')
			.eq('slug', category)
			.single();

		if (categoryError) {
			console.error('Error loading category:', categoryError);
		}

		return {
			category: categoryInfo || { name: category, description: 'Servicios profesionales' },
			providers: providers || [],
			services: services || [],
			preloaded: true
		};

	} catch (err) {
		console.error('Error in page load:', err);
		throw error(500, 'Error interno del servidor');
	}
}; 