import { json, type RequestHandler } from '@sveltejs/kit';
import { validateEmail } from '$lib/exceptions';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email } = await request.json();
		
		console.log(`🔍 Probando validación de email: ${email}`);
		
		// Probar nuestra validación
		try {
			validateEmail(email);
			console.log(`✅ Nuestra validación: OK`);
		} catch (error) {
			console.log(`❌ Nuestra validación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
		}
		
		// Probar regex directamente
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const regexResult = emailRegex.test(email);
		console.log(`🔍 Regex test: ${regexResult ? 'PASS' : 'FAIL'}`);
		
		// Probar con Supabase directamente
		const { createClient } = await import('@supabase/supabase-js');
		const supabase = createClient(
			'https://fallback.supabase.co',
			'fallback-anon-key'
		);
		
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password: 'testpassword123',
				options: {
					emailRedirectTo: undefined
				}
			});
			
			if (error) {
				console.log(`❌ Supabase error: ${error.message}`);
				return json({
					success: false,
					email,
					ourValidation: 'PASS',
					regexTest: regexResult,
					supabaseError: error.message,
					supabaseStatus: error.status
				});
			} else {
				console.log(`✅ Supabase: OK`);
				return json({
					success: true,
					email,
					ourValidation: 'PASS',
					regexTest: regexResult,
					supabaseResult: 'SUCCESS'
				});
			}
		} catch (supabaseError) {
			console.log(`❌ Supabase exception: ${supabaseError instanceof Error ? supabaseError.message : 'Error desconocido'}`);
			return json({
				success: false,
				email,
				ourValidation: 'PASS',
				regexTest: regexResult,
				supabaseException: supabaseError instanceof Error ? supabaseError.message : 'Error desconocido'
			});
		}
		
	} catch (error) {
		console.error('💥 Error en test de email:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Error desconocido'
		}, { status: 500 });
	}
};
