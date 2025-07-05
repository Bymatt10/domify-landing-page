import type { LayoutServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, fetch }) => {
	const { session, user } = await safeGetSession();

	let isProvider = false;
	let isAdmin = false;
	let providerProfile = null;

	if (user) {
		// Verificar si es proveedor - ahora con verificación más robusta
		const { data: provider, error: providerError } = await supabaseAdmin
			.from('provider_profiles')
			.select('*')
			.eq('user_id', user.id)
			.eq('is_active', true)
			.single();

		if (providerError) {
		} else if (provider) {
			providerProfile = provider;
		}

		// Verificar si es admin
		const userRole = user.user_metadata?.role;
		isAdmin = userRole === 'admin';
		
		// Un usuario es proveedor si tiene un perfil activo O si tiene el rol en metadata
		isProvider = (providerProfile !== null) || userRole === 'provider';

		// Debug: Log the exact boolean value
	} else {
	}

	// Crear un objeto de datos limpio para serialización
	const data = {
		session: session ? {
			...session,
			user: undefined // Removemos el usuario del objeto session para evitar duplicación
		} : null,
		user: user ? {
			id: user.id,
			email: user.email,
			user_metadata: user.user_metadata,
			email_confirmed_at: user.email_confirmed_at
		} : null,
		isProvider,
		isAdmin,
		providerProfile // Incluimos el perfil completo del proveedor
	};

	return data;
}; 