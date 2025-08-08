import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

export const POST: RequestHandler = async ({ locals: { supabaseAdmin } }) => {
	try {
		console.log('🔄 Actualizando avatares de todos los proveedores...');
		
		// Obtener todos los proveedores activos que no tienen photo_url o tienen photo_url null
		const { data: providers, error: fetchError } = await supabaseAdmin
			.from('provider_profiles')
			.select('id, business_name, photo_url')
			.eq('is_active', true)
			.or('photo_url.is.null,photo_url.eq.,photo_url.eq./img/cleaning.png');
			
		if (fetchError) {
			console.error('❌ Error obteniendo proveedores:', fetchError);
			throw new Error(`Error obteniendo proveedores: ${fetchError.message}`);
		}
		
		if (!providers || providers.length === 0) {
			console.log('ℹ️ No hay proveedores que necesiten actualización de avatar');
			return json({
				success: true,
				message: 'No hay proveedores que necesiten actualización de avatar',
				updatedCount: 0,
				providers: []
			});
		}
		
		console.log(`📋 Encontrados ${providers.length} proveedores para actualizar`);
		
		const defaultAvatarUrl = '/img/avatars/307ce493-b254-4b2d-8ba4-d12c080d6651.jpg';
		let updatedCount = 0;
		const errors: string[] = [];
		const updatedProviders: any[] = [];
		
		// Actualizar cada proveedor
		for (const provider of providers) {
			try {
				const { error: updateError } = await supabaseAdmin
					.from('provider_profiles')
					.update({ photo_url: defaultAvatarUrl })
					.eq('id', provider.id);
					
				if (updateError) {
					console.error(`❌ Error actualizando ${provider.business_name}:`, updateError);
					errors.push(`Error actualizando ${provider.business_name}: ${updateError.message}`);
				} else {
					console.log(`✅ Avatar actualizado para: ${provider.business_name}`);
					updatedCount++;
					updatedProviders.push({
						id: provider.id,
						business_name: provider.business_name,
						old_photo_url: provider.photo_url,
						new_photo_url: defaultAvatarUrl
					});
				}
			} catch (error) {
				console.error(`❌ Error procesando ${provider.business_name}:`, error);
				errors.push(`Error procesando ${provider.business_name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
			}
		}
		
		console.log(`✅ Actualización completada: ${updatedCount} proveedores actualizados`);
		
		return json({
			success: true,
			message: `Actualización completada: ${updatedCount} proveedores actualizados`,
			updatedCount,
			totalProviders: providers.length,
			defaultAvatarUrl,
			updatedProviders,
			errors: errors.length > 0 ? errors : undefined
		});
	} catch (error) {
		console.error('💥 Error en actualización de avatares:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};
