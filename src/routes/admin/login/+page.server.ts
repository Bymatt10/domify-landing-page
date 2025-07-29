import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const { data: { user } } = await supabase.auth.getUser();
	const { data: { session } } = await supabase.auth.getSession();

	if (user && session) {
        // Si hay una sesión, verificamos el rol del usuario desde auth.users
        const userRole = user.user_metadata?.role;

        if (userRole === 'admin') {
            // Si el usuario ya es un admin logueado, lo mandamos al dashboard
            throw redirect(303, '/admin');
        }
	}

    // Si hay algún mensaje de error en la URL (por ejemplo, desde otra página),
    // lo pasamos al componente de la página para que lo muestre.
    const formError = url.searchParams.get('error');

	return { formError };
}; 