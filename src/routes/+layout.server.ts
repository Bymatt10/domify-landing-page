import type { LayoutServerLoad } from './$types';
import { createSupabaseAdminClient } from '$lib/supabase-server';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, fetch }) => {
	const { session, user } = await safeGetSession();

	let isProvider = false;
	let isAdmin = false;

	if (user) {
		const supabaseAdmin = createSupabaseAdminClient(fetch);

		// Verificar si es proveedor
		const { data: providerProfile } = await supabaseAdmin
			.from('provider_profiles')
			.select('id')
			.eq('user_id', user.id)
			.single();

		// Verificar si es admin
		const { data: customerProfile } = await supabaseAdmin
			.from('customers')
			.select('role')
			.eq('user_id', user.id)
			.single();

		isAdmin = (customerProfile?.role === 'admin') || user.user_metadata?.role === 'admin';
		isProvider = !!providerProfile || user.user_metadata?.role === 'provider';

		console.log('User:', {
			id: user.id,
			email: user.email,
			isProvider,
			isAdmin,
			user_metadata: user.user_metadata,
			customerProfile
		});
	}

	return {
		session,
		user,
		isProvider,
		isAdmin
	};
}; 