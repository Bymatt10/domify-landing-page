import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

export const GET: RequestHandler = async ({ locals: { supabaseAdmin } }) => {
	try {
		console.log('🔍 Verificando esquema de la tabla provider_profiles...');
		
		// Obtener un proveedor para ver qué campos tiene
		const { data: provider, error: fetchError } = await supabaseAdmin
			.from('provider_profiles')
			.select('*')
			.limit(1);
			
		if (fetchError) {
			console.error('❌ Error obteniendo proveedor:', fetchError);
			throw new Error(`Error obteniendo proveedor: ${fetchError.message}`);
		}
		
		if (!provider || provider.length === 0) {
			return json({
				success: true,
				message: 'No hay proveedores en la base de datos',
				fields: [],
				sampleProvider: null
			});
		}
		
		const sampleProvider = provider[0];
		const fields = Object.keys(sampleProvider);
		
		console.log(`✅ Campos encontrados: ${fields.join(', ')}`);
		
		return json({
			success: true,
			fields,
			sampleProvider,
			totalFields: fields.length
		});
	} catch (error) {
		console.error('💥 Error verificando esquema:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};
