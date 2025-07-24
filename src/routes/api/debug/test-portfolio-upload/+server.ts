import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import { getSupabaseUrl, getSupabaseAnonKey } from '$lib/env-utils';

export async function GET() {
	try {
		// Test 1: Check if we can access provider_profiles table
		const { data: profiles, error: profilesError } = await supabase
			.from('provider_profiles')
			.select('id, user_id, portfolio')
			.limit(1);

		if (profilesError) {
			return json({
				success: false,
				error: 'Error accessing provider_profiles table',
				details: profilesError
			});
		}

		// Test 2: Check if we can update a provider profile
		if (profiles && profiles.length > 0) {
			const testProfile = profiles[0];
			const testPortfolio = [
				{
					id: 'test-' + Date.now(),
					title: 'Test Item',
					description: 'Test description',
					image_url: 'https://example.com/test.jpg',
					media_type: 'image',
					created_at: new Date().toISOString()
				}
			];

			const { error: updateError } = await supabase
				.from('provider_profiles')
				.update({
					portfolio: testPortfolio,
					updated_at: new Date().toISOString()
				})
				.eq('id', testProfile.id);

			if (updateError) {
				return json({
					success: false,
					error: 'Error updating provider profile',
					details: updateError,
					testProfile: testProfile
				});
			}

			// Test 3: Check storage permissions
			const { data: storageTest, error: storageError } = await supabase.storage
				.from('domify')
				.list('providers', {
					limit: 1
				});

			return json({
				success: true,
				message: 'All tests passed',
				profiles: profiles,
				storageTest: storageTest,
				storageError: storageError,
				supabaseUrl: getSupabaseUrl(),
				hasAnonKey: !!getSupabaseAnonKey()
			});
		}

		return json({
			success: false,
			error: 'No provider profiles found for testing'
		});

	} catch (error: any) {
		return json({
			success: false,
			error: 'Unexpected error',
			details: error.message || error
		});
	}
} 