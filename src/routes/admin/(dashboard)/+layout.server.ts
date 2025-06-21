import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { safeGetUser, checkUserRole } from '$lib/auth-fixes';

export const load: LayoutServerLoad = async ({ locals: { supabase } }) => {
	// Usar función helper segura
	const { user, error: authError } = await safeGetUser(supabase);

	// Si no hay usuario, redirigir al login de admin
	if (!user || authError) {
		throw redirect(303, '/admin/login');
	}

	console.log(`[Admin Guard] Verificando usuario ID: ${user.id}`);

	// Verificar rol usando función helper
	const { hasRole, profile, error } = await checkUserRole(supabase, user.id, 'admin');
	
	if (error) {
		console.error('[Admin Guard] Error al verificar rol:', error);
	}

	console.log(`[Admin Guard] Perfil encontrado:`, profile);

	// Si no tiene rol de admin, redirigir con error
	if (!hasRole) {
		console.log(`[Admin Guard] ¡Acceso DENEGADO! Rol encontrado: '${profile?.role}'. Se esperaba: 'admin'.`);
		await supabase.auth.signOut(); // Por seguridad, cerramos la sesión no autorizada
		throw redirect(303, '/admin/login?error=Acceso denegado. Se requieren permisos de administrador.');
	}

	console.log(`[Admin Guard] ¡Acceso CONCEDIDO! El usuario tiene el rol 'admin'.`);

	// Si todo está en orden, retornamos el usuario y perfil
	return {
		user,
		profile
	};
}; 