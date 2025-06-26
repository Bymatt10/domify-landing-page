import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendProviderWelcomeEmail } from '$lib/email-service';

export const GET: RequestHandler = async () => {
	try {
		console.log('Testing email service...');
		
		// Test data
		const testData = {
			providerEmail: 'matthewreyesvanegas@icloud.com',
			providerName: 'Test Provider',
			tempPassword: 'TempPass123',
			loginUrl: 'http://localhost:5173/auth/login'
		};

		const result = await sendProviderWelcomeEmail(
			testData.providerEmail,
			testData.providerName,
			testData.tempPassword,
			testData.loginUrl
		);

		console.log('Email sent successfully:', result);

		return json({
			success: true,
			message: 'Test email sent successfully',
			result,
			testData
		});

	} catch (error) {
		console.error('Email test failed:', error);
		
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			details: error
		}, { status: 500 });
	}
}; 