import type { LayoutServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, fetch }) => {
	const { session, user } = await safeGetSession();

	let isProvider = false;
	let isAdmin = false;

	if (user) {
		// Usar el cliente admin directamente

		// Verificar si es proveedor
		const { data: providerProfile } = await supabaseAdmin
			.from('provider_profiles')
			.select('id')
			.eq('user_id', user.id)
			.single();

		// Verificar si es admin - ahora el rol viene de auth.users
		isAdmin = user.user_metadata?.role === 'admin';
		isProvider = !!providerProfile || user.user_metadata?.role === 'provider';

		console.log('User:', {
			id: user.id,
			email: user.email,
			isProvider,
			isAdmin,
			user_metadata: user.user_metadata
		});
	}

	return {
		session,
		user,
		isProvider,
		isAdmin
	};
}; 