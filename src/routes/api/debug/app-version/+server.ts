import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const version = {
		version: '1.0.0',
		buildTime: new Date().toISOString(),
		features: {
			optimizedApiRequests: true,
			supabaseConfigFixed: true,
			reviewsWorking: true,
			cacheBusting: true
		},
		lastDeployment: '2025-07-25T14:20:00Z',
		changes: [
			'Fixed infinite loop in services page API requests',
			'Added debouncing to filter and search functionality',
			'Fixed Supabase service role key configuration',
			'Added cache busting parameters',
			'Optimized provider services fetching'
		]
	};

	return json(version);
}; 