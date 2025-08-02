import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '$lib/env-utils';

export async function GET() {
	try {
		const supabaseUrl = getSupabaseUrl();
		const serviceRoleKey = getSupabaseServiceRoleKey();
		const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

		const { data: users, error } = await adminSupabase.auth.admin.listUsers();
		
		if (error) {
			return json({ error: 'Error obteniendo usuarios', details: error }, { status: 500 });
		}

		return json({
			success: true,
			totalUsers: users.users.length,
			users: users.users.map(user => ({
				id: user.id,
				email: user.email,
				role: user.user_metadata?.role || 'user',
				created_at: user.created_at,
				last_sign_in: user.last_sign_in_at
			}))
		});

	} catch (error) {
		return json({ 
			error: 'Error durante la operación',
			details: error instanceof Error ? error.message : 'Error desconocido'
		}, { status: 500 });
	}
} 