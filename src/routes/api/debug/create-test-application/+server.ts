import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';

// Get environment variables with fallbacks
const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();
const SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

/**
 * @swagger
 * /api/debug/create-test-application:
 *   post:
 *     summary: Create a test provider application
 *     description: Creates a test provider application with user_id for testing approval process
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Test application created successfully
 *       500:
 *         description: Error creating test application
 */

// Función helper para hacer queries directas con fetch
async function directSupabaseQuery(endpoint: string, method = 'GET', body?: any) {
	const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
	const options: RequestInit = {
		method,
		headers: {
			'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
			'apikey': SERVICE_ROLE_KEY,
			'Content-Type': 'application/json',
			'Prefer': 'return=representation'
		}
	};

	if (body && method !== 'GET') {
		options.body = JSON.stringify(body);
	}

	const response = await fetch(url, options);
	
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Supabase query failed: ${response.status} ${errorText}`);
	}

	return response.json();
}

export const POST: RequestHandler = async () => {
	try {
		console.log('🧪 Creating test application directly in database...');

		const testApplication = {
			email: 'matthewreyesvanegas@icloud.com',
			headline: 'Test Provider - SendGrid Email',
			bio: 'Esta es una aplicación de prueba para verificar el envío de emails con SendGrid usando la dirección verificada.',
			hourly_rate: 30,
			location: 'Managua, Nicaragua',
			phone: '+505 8888-0000',
			status: 'submitted',
			application_data: {
				experience_years: 3,
				certifications: ['Certificación de Limpieza Profesional'],
				insurance: true,
				tools_own: true,
				availability: 'Lunes a Viernes, 8:00 AM - 5:00 PM'
			},
			submitted_at: new Date().toISOString(),
			created_at: new Date().toISOString()
		};

		// Create the application directly in database
		const createdApp = await directSupabaseQuery('provider_applications', 'POST', testApplication);
		console.log('✅ Application created:', createdApp);

		// Get categories for assignment
		const categories = await directSupabaseQuery('categories?limit=3');
		console.log('Available categories:', categories);

		// Assign categories to the application
		if (categories && categories.length > 0 && createdApp.length > 0) {
			const appId = createdApp[0].id;
			
			// Create category assignments for cleaning and maintenance
			const categoryAssignments = categories
				.filter((cat: any) => ['cleaning', 'maintenance'].includes(cat.slug))
				.map((category: any) => ({
					application_id: appId,
					category_id: category.id
				}));

			if (categoryAssignments.length > 0) {
				await directSupabaseQuery('provider_application_categories', 'POST', categoryAssignments);
				console.log('✅ Categories assigned successfully');
			}
		}

		return json({
			success: true,
			message: 'Test application created successfully!',
			application: createdApp[0],
			testData: testApplication,
			next_steps: [
				'1. Go to http://localhost:5173/admin/provider-applications',
				'2. Find the application for "Test Provider - SendGrid Email"',
				'3. Click "Aprobar" to approve it',
				'4. Check the email matthewreyesvanegas@icloud.com for credentials',
				'5. Verify it appears in customers and providers pages'
			]
		});

	} catch (error) {
		console.error('Error creating test application:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			details: error
		}, { status: 500 });
	}
}; 