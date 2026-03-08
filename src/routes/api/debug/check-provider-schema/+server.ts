import { json, type RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

export const GET: RequestHandler = async ({ locals: { supabaseAdmin } }) => {
	try {
		console.log('🔍 Verificando esquema de la tabla provider_profiles...');
		
		// Obtener esquema real de la base de datos
		const { data: columns, error: schemaError } = await supabaseAdmin
			.rpc('get_table_columns', { table_name: 'provider_profiles' });
			
		// Si el RPC no existe (lo más probable), intentar con una consulta SQL directa si es posible
		// Pero como no tenemos acceso a SQL directo fácilmente, usaremos otro truco
		
		// Un truco para ver columnas es intentar un select de una columna inexistente y ver el error de PostgREST
		// Pero mejor intentar traer un registro y ver qué campos tiene el objeto si existiera.
		
		// Obtener un proveedor para ver qué campos tiene
		const { data: providers, error: fetchError } = await supabaseAdmin
			.from('provider_profiles')
			.select('*')
			.limit(1);
			
		if (fetchError) {
			console.error('❌ Error obteniendo proveedor:', fetchError);
			return json({
				success: false,
				error: fetchError.message,
				hint: 'Si el error menciona una columna faltante, es que esa columna no existe en provider_profiles'
			});
		}
		
		let fields: string[] = [];
		if (providers && providers.length > 0) {
			fields = Object.keys(providers[0]);
		}
		
		// Intentar obtener nombres de columnas vía PostgREST OPTIONS (no siempre disponible via client)
		
		return json({
			success: true,
			fields,
			message: fields.length > 0 ? 'Campos recuperados' : 'Tabla vacía, no se pueden determinar campos vía SELECT *',
			table: 'provider_profiles'
		});
	} catch (error) {
		console.error('💥 Error verificando esquema:', error);
		const errorResponse = ExceptionHandler.handle(error);
		return json(errorResponse, { status: errorResponse.error.statusCode || 500 });
	}
};
