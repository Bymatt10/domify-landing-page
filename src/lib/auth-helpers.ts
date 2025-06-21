import { supabase } from './supabase';

export interface UserProfile {
	first_name: string;
	last_name: string;
	email: string;
}

/**
 * Handles email confirmation errors gracefully
 */
export function handleEmailConfirmationError(error: any) {
	const errorMessage = error?.message || '';
	
	if (errorMessage.includes('confirmation email') || 
		errorMessage.includes('Error sending') ||
		errorMessage.includes('email')) {
		return {
			isEmailError: true,
			message: 'Cuenta creada exitosamente. En desarrollo local, puedes iniciar sesión directamente.',
			shouldAutoSignIn: true
		};
	}
	
	return {
		isEmailError: false,
		message: errorMessage,
		shouldAutoSignIn: false
	};
	
}

/**
 * Creates a customer profile after successful auth signup
 */
export async function createCustomerProfile(profile: UserProfile, authUserId: string, role: string = 'customer') {
	try {
		// Create customer profile directly (no marketplace.users table needed)
		const { data: customerData, error: customerError } = await supabase
			.from('customers')
			.insert({
				user_id: authUserId,
				first_name: profile.first_name,
				last_name: profile.last_name,
				role: role
			})
			.select()
			.single();

		if (customerError) {
			console.error('Error creating customer profile:', customerError);
			return { success: false, error: customerError.message };
		}

		return { 
			success: true, 
			customer: customerData 
		};

	} catch (error) {
		console.error('Unexpected error creating customer profile:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Error inesperado' 
		};
	}
}

/**
 * Signs up a user and creates their customer profile
 */
export async function signUpWithProfile(profile: UserProfile, password: string, role: string = 'customer') {
	try {
		// First, sign up with Supabase Auth
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email: profile.email,
			password: password,
			options: {
				data: {
					first_name: profile.first_name,
					last_name: profile.last_name,
					role: role, // Default to customer now
				}
			}
		});

		if (authError) {
			// Handle email confirmation errors gracefully
			const emailError = handleEmailConfirmationError(authError);
			if (emailError.isEmailError) {
				return {
					success: true,
					needsConfirmation: true,
					user: authData?.user,
					message: emailError.message
				};
			}
			return { success: false, error: authError.message };
		}

		if (!authData.user) {
			return { success: false, error: 'No se pudo crear el usuario' };
		}

		// If user was created but not confirmed, we'll handle it differently
		if (authData.user && !authData.user.email_confirmed_at) {
			// In local development, we might want to auto-confirm
			// For now, return success and let the user know
			return {
				success: true,
				needsConfirmation: true,
				user: authData.user,
				message: 'Usuario creado. En desarrollo local, puedes iniciar sesión directamente.'
			};
		}

		// The customer profile should be created automatically by the database trigger
		// Let's wait a moment and then check if it exists
		await new Promise(resolve => setTimeout(resolve, 100));

		// Check if profile was created by trigger
		const { data: existingProfile, error: profileError } = await supabase
			.from('customers')
			.select('*')
			.eq('user_id', authData.user.id)
			.single();

		if (profileError || !existingProfile) {
			// If trigger didn't work, create manually
			const profileResult = await createCustomerProfile(profile, authData.user.id, role);
			
			if (!profileResult.success) {
				return { 
					success: false, 
					error: `Usuario creado pero error en perfil: ${profileResult.error}` 
				};
			}

			return {
				success: true,
				user: authData.user,
				profile: profileResult.customer,
				message: 'Cuenta creada exitosamente'
			};
		}

		return {
			success: true,
			user: authData.user,
			profile: existingProfile,
			message: 'Cuenta creada exitosamente'
		};

	} catch (error) {
		console.error('Error in signUpWithProfile:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Error inesperado'
		};
	}
} 