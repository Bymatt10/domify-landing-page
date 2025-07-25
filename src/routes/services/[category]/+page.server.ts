import { error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const category = params.category;
	
	if (!category) {
		throw error(404, 'Categoría no encontrada');
	}

	try {
		// Primero obtener la categoría
		const { data: categoryInfo, error: categoryError } = await supabaseAdmin
			.from('categories')
			.select('id, name, description, icon, slug')
			.eq('slug', category)
			.single();

		if (categoryError) {
			console.error('Error loading category:', categoryError);
			throw error(404, 'Categoría no encontrada');
		}

		// Obtener proveedores que pertenecen a esta categoría
		const { data: providerCategories, error: pcError } = await supabaseAdmin
			.from('provider_categories')
			.select('provider_profile_id')
			.eq('category_id', categoryInfo.id);

		if (pcError) {
			console.error('Error loading provider categories:', pcError);
			throw error(500, 'Error al cargar proveedores');
		}

		let providers: any[] = [];
		if (providerCategories && providerCategories.length > 0) {
			const providerIds = providerCategories.map(pc => pc.provider_profile_id);
			
			// Cargar proveedores
			const { data: providersData, error: providersError } = await supabaseAdmin
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
				.eq('is_active', true)
				.order('average_rating', { ascending: false });

			if (providersError) {
				console.error('Error loading providers:', providersError);
				throw error(500, 'Error al cargar proveedores');
			}

			providers = providersData || [];
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
			.eq('category_id', categoryInfo.id)
			.order('created_at', { ascending: false });

		if (servicesError) {
			console.error('Error loading services:', servicesError);
			// No lanzar error aquí, solo log
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