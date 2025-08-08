import { json, type RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';

export const GET: RequestHandler = async () => {
	try {
		const supabaseUrl = getSupabaseUrl();
		const supabaseAnonKey = getSupabaseAnonKey();
		const supabaseServiceRoleKey = getSupabaseServiceRoleKey();
		
		// Verificar si las credenciales son las de fallback
		const isUsingFallback = {
			url: supabaseUrl === 'https://fallback.supabase.co',
			anonKey: supabaseAnonKey === 'fallback-anon-key',
			serviceRoleKey: supabaseServiceRoleKey === 'fallback-service-role-key'
		};
		
		return json({
			success: true,
			config: {
				supabaseUrl,
				supabaseAnonKey: supabaseAnonKey.substring(0, 20) + '...',
				supabaseServiceRoleKey: supabaseServiceRoleKey.substring(0, 20) + '...',
				isUsingFallback,
				env: {
					DEV: import.meta.env.DEV,
					PROD: import.meta.env.PROD,
					MODE: import.meta.env.MODE
				}
			}
		});
		
	} catch (error) {
		console.error('💥 Error verificando configuración:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido'
		}, { status: 500 });
	}
};
