import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
	// Retornar datos básicos por defecto
	// La autenticación se manejará en el cliente
	return {
		session: null,
		user: null,
		isProvider: false,
		isAdmin: false,
		providerProfile: null
	};
}; 