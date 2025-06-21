import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const { data: { session } } = await supabase.auth.getSession();

	if (session) {
        // Si hay una sesión, verificamos el rol del usuario
		const { data: profile } = await supabase
			.from('customers')
			.select('role')
			.eq('user_id', session.user.id)
			.single();

        if (profile?.role === 'admin') {
            // Si el usuario ya es un admin logueado, lo mandamos al dashboard
            throw redirect(303, '/admin');
        }
	}

    // Si hay algún mensaje de error en la URL (por ejemplo, desde otra página),
    // lo pasamos al componente de la página para que lo muestre.
    const formError = url.searchParams.get('error');

	return { formError };
}; 