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
 * Creates a user in the marketplace.users table after successful auth signup
 */
export async function createMarketplaceUser(profile: UserProfile, authUserId: string) {
	try {
		// Insert into marketplace.users table
		const { data: userData, error: userError } = await supabase
			.from('users')
			.insert({
				id: authUserId, // Use the same ID from auth.users
				email: profile.email,
				password: '', // This is handled by Supabase Auth
				role: 'provider', // Always default to provider
			})
			.select()
			.single();

		if (userError) {
			console.error('Error creating marketplace user:', userError);
			return { success: false, error: userError.message };
		}

		// Create customer profile
		const { data: customerData, error: customerError } = await supabase
			.from('customers')
			.insert({
				user_id: authUserId,
				first_name: profile.first_name,
				last_name: profile.last_name,
			})
			.select()
			.single();

		if (customerError) {
			console.error('Error creating customer profile:', customerError);
			return { success: false, error: customerError.message };
		}

		return { 
			success: true, 
			user: userData, 
			customer: customerData 
		};

	} catch (error) {
		console.error('Unexpected error creating marketplace user:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Error inesperado' 
		};
	}
}

/**
 * Signs up a user and creates their marketplace profile
 */
export async function signUpWithProfile(profile: UserProfile, password: string) {
	try {
		// First, sign up with Supabase Auth
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email: profile.email,
			password: password,
			options: {
				data: {
					first_name: profile.first_name,
					last_name: profile.last_name,
					role: 'provider', // Always default to provider
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

		// Create marketplace profile
		const marketplaceResult = await createMarketplaceUser(profile, authData.user.id);

		if (!marketplaceResult.success) {
			return { 
				success: false, 
				error: `Usuario creado pero error en perfil: ${marketplaceResult.error}` 
			};
		}

		return {
			success: true,
			user: authData.user,
			profile: marketplaceResult,
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