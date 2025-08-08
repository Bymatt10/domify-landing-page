import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const SUPABASE_URL = getSupabaseUrl();
		const SUPABASE_ANON_KEY = getSupabaseAnonKey();
		const SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

		console.log('🔍 Probando consulta de proveedores...');
		
		// Test 1: Verificar configuración
		const config = {
			supabaseUrl: SUPABASE_URL,
			hasAnonKey: !!SUPABASE_ANON_KEY,
			hasServiceRoleKey: !!SERVICE_ROLE_KEY,
			serviceRoleKeyLength: SERVICE_ROLE_KEY ? SERVICE_ROLE_KEY.length : 0
		};

		// Test 2: Consulta simple a provider_profiles
		let providersResult = null;
		try {
			const apiKey = SERVICE_ROLE_KEY && SERVICE_ROLE_KEY !== 'fallback-service-role-key' 
				? SERVICE_ROLE_KEY 
				: SUPABASE_ANON_KEY;

			const response = await fetch(`${SUPABASE_URL}/rest/v1/provider_profiles?is_active=eq.true&limit=5`, {
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'apikey': apiKey,
					'Content-Type': 'application/json',
					'Prefer': 'return=representation'
				}
			});

			if (response.ok) {
				providersResult = await response.json();
				console.log(`✅ Proveedores encontrados: ${providersResult.length}`);
			} else {
				const errorText = await response.text();
				console.error('❌ Error en consulta de proveedores:', response.status, errorText);
				providersResult = { error: response.status, message: errorText };
			}
		} catch (error) {
			console.error('❌ Error en consulta de proveedores:', error);
			providersResult = { error: error instanceof Error ? error.message : 'Error desconocido' };
		}

		// Test 3: Consulta a categories
		let categoriesResult = null;
		try {
			const apiKey = SERVICE_ROLE_KEY && SERVICE_ROLE_KEY !== 'fallback-service-role-key' 
				? SERVICE_ROLE_KEY 
				: SUPABASE_ANON_KEY;

			const response = await fetch(`${SUPABASE_URL}/rest/v1/categories?limit=5`, {
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'apikey': apiKey,
					'Content-Type': 'application/json',
					'Prefer': 'return=representation'
				}
			});

			if (response.ok) {
				categoriesResult = await response.json();
				console.log(`✅ Categorías encontradas: ${categoriesResult.length}`);
			} else {
				const errorText = await response.text();
				console.error('❌ Error en consulta de categorías:', response.status, errorText);
				categoriesResult = { error: response.status, message: errorText };
			}
		} catch (error) {
			console.error('❌ Error en consulta de categorías:', error);
			categoriesResult = { error: error instanceof Error ? error.message : 'Error desconocido' };
		}

		return json({
			success: true,
			config,
			providers: providersResult,
			categories: categoriesResult,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('💥 Error en test de proveedores:', error);
		return json({ 
			success: false, 
			error: error instanceof Error ? error.message : 'Error desconocido' 
		}, { status: 500 });
	}
};
