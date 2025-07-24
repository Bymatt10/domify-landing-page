import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET() {
	try {
		// Get sample data to see what columns exist
		const { data: sampleData, error: sampleError } = await supabase
			.from('provider_profiles')
			.select('*')
			.limit(1);

		if (sampleError) {
			return json({
				success: false,
				error: 'Error accessing provider_profiles table',
				details: sampleError
			});
		}

		// Try to select specific columns to see what exists
		const { data: basicData, error: basicError } = await supabase
			.from('provider_profiles')
			.select('id, user_id, business_name, description, created_at, updated_at')
			.limit(1);

		// Try to select portfolio column specifically
		const { data: portfolioData, error: portfolioError } = await supabase
			.from('provider_profiles')
			.select('portfolio')
			.limit(1);

		return json({
			success: true,
			sampleData: sampleData,
			basicData: basicData,
			basicError: basicError,
			portfolioData: portfolioData,
			portfolioError: portfolioError,
			hasPortfolioColumn: !portfolioError,
			availableColumns: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : []
		});

	} catch (error: any) {
		return json({
			success: false,
			error: 'Unexpected error',
			details: error.message || error
		});
	}
} 