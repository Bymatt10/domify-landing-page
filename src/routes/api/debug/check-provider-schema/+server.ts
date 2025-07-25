import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		// Obtener información de la tabla provider_profiles
		const { data: providers, error } = await supabaseAdmin
			.from('provider_profiles')
			.select('*')
			.limit(1);

		if (error) {
			return json({
				error: 'Error accessing provider_profiles table',
				details: error,
				timestamp: new Date().toISOString()
			}, { status: 500 });
		}

		// Si hay datos, obtener las columnas del primer registro
		let columns: string[] = [];
		if (providers && providers.length > 0) {
			columns = Object.keys(providers[0]);
		}

		// También intentar obtener información de la tabla categories
		const { data: categories, error: catError } = await supabaseAdmin
			.from('categories')
			.select('*')
			.limit(1);

		let categoryColumns: string[] = [];
		if (categories && categories.length > 0) {
			categoryColumns = Object.keys(categories[0]);
		}

		// Y provider_categories
		const { data: providerCategories, error: pcError } = await supabaseAdmin
			.from('provider_categories')
			.select('*')
			.limit(1);

		let pcColumns: string[] = [];
		if (providerCategories && providerCategories.length > 0) {
			pcColumns = Object.keys(providerCategories[0]);
		}

		return json({
			timestamp: new Date().toISOString(),
			provider_profiles: {
				columns: columns,
				sample_data: providers?.[0] || null,
				error: error ? (error as any).message || 'Unknown error' : null
			},
			categories: {
				columns: categoryColumns,
				sample_data: categories?.[0] || null,
				error: catError ? (catError as any).message || 'Unknown error' : null
			},
			provider_categories: {
				columns: pcColumns,
				sample_data: providerCategories?.[0] || null,
				error: pcError ? (pcError as any).message || 'Unknown error' : null
			}
		});

	} catch (error) {
		return json({
			error: 'Unexpected error',
			details: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
}; 