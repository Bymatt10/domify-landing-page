import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// No necesitamos cargar datos específicos para la página de privacidad
	// pero mantenemos la estructura por consistencia
	return {
		// Datos vacíos por ahora
	};
}; 