import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

export const GET: RequestHandler = async ({ url, locals: { supabaseAdmin } }) => {
	try {
		const categorySlug = url.searchParams.get('category');
		console.log(`🔍 Verificando proveedores para categoría: ${categorySlug}`);
		
		if (!categorySlug) {
			throw new Error('Se requiere el parámetro category');
		}
		
		// Obtener la categoría por slug
		const { data: category, error: categoryError } = await supabaseAdmin
			.from('categories')
			.select('id, name, slug')
			.eq('slug', categorySlug)
			.single();
			
		if (categoryError || !category) {
			throw new Error(`Categoría "${categorySlug}" no encontrada`);
		}
		
		console.log(`📂 Categoría encontrada: ${category.name} (ID: ${category.id})`);
		
		// Obtener proveedores asignados a esta categoría
		const { data: categoryProviders, error: providersError } = await supabaseAdmin
			.from('provider_categories')
			.select(`
				provider_profile_id,
				provider_profiles!inner(
					id,
					business_name,
					headline,
					location,
					hourly_rate,
					is_active
				)
			`)
			.eq('category_id', category.id);
			
		if (providersError) {
			console.error('❌ Error obteniendo proveedores de categoría:', providersError);
			throw new Error(`Error obteniendo proveedores: ${providersError.message}`);
		}
		
		// Formatear resultados
		const providers = categoryProviders?.map((cp: any) => ({
			provider_profile_id: cp.provider_profile_id,
			...cp.provider_profiles
		})) || [];
		
		console.log(`✅ Encontrados ${providers.length} proveedores para la categoría`);
		
		return json({
			success: true,
			category: {
				id: category.id,
				name: category.name,
				slug: category.slug
			},
			providers,
			count: providers.length,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('💥 Error verificando proveedores de categoría:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};
