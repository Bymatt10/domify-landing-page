import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const status = {
		timestamp: new Date().toISOString(),
		environment: 'production',
		version: '1.0.0',
		
		// Database connectivity
		database: {
			status: 'checking...',
			providers_count: 0,
			reviews_count: 0,
			services_count: 0
		},
		
		// API endpoints
		apis: {
			providers: 'checking...',
			reviews: 'checking...',
			services: 'checking...',
			health: 'checking...'
		},
		
		// Configuration
		config: {
			supabase_url: process.env.PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
			supabase_anon_key: process.env.PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
			supabase_service_key: (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY) ? 'configured' : 'missing'
		},
		
		// Recent changes
		recent_changes: [
			'Fixed infinite loop in API requests',
			'Added debouncing to filters',
			'Fixed Supabase configuration',
			'Added cache busting'
		]
	};

	try {
		// Test database connectivity
		const { count: providersCount } = await supabaseAdmin
			.from('provider_profiles')
			.select('*', { count: 'exact', head: true });
		
		const { count: reviewsCount } = await supabaseAdmin
			.from('reviews')
			.select('*', { count: 'exact', head: true });
		
		const { count: servicesCount } = await supabaseAdmin
			.from('services')
			.select('*', { count: 'exact', head: true });

		status.database = {
			status: 'connected',
			providers_count: providersCount || 0,
			reviews_count: reviewsCount || 0,
			services_count: servicesCount || 0
		};

		// Test API endpoints
		const baseUrl = 'https://domify.app';
		
		try {
			const providersResponse = await fetch(`${baseUrl}/api/providers?category=jardineria`);
			status.apis.providers = providersResponse.ok ? 'working' : `error: ${providersResponse.status}`;
		} catch (e) {
			status.apis.providers = 'error: network';
		}

		try {
			const reviewsResponse = await fetch(`${baseUrl}/api/reviews?provider_id=78b8ce65-2ddc-4313-ae75-db64618580e8`);
			status.apis.reviews = reviewsResponse.ok ? 'working' : `error: ${reviewsResponse.status}`;
		} catch (e) {
			status.apis.reviews = 'error: network';
		}

		try {
			const servicesResponse = await fetch(`${baseUrl}/api/services?category=jardineria`);
			status.apis.services = servicesResponse.ok ? 'working' : `error: ${servicesResponse.status}`;
		} catch (e) {
			status.apis.services = 'error: network';
		}

		try {
			const healthResponse = await fetch(`${baseUrl}/api/health`);
			status.apis.health = healthResponse.ok ? 'working' : `error: ${healthResponse.status}`;
		} catch (e) {
			status.apis.health = 'error: network';
		}

	} catch (error) {
		status.database.status = 'error';
		console.error('Error checking app status:', error);
	}

	return json(status);
}; 