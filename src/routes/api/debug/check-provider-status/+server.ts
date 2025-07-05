import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';

export const GET: RequestHandler = async ({ locals }) => {
    const { session, user } = await locals.safeGetSession();

    if (!user) {
        return json({
            status: 'error',
            message: 'No user authenticated',
            data: null
        });
    }

    // Get provider profile
    const { data: providerProfile, error: providerError } = await supabaseAdmin
        .from('provider_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Get user metadata from auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user.id);

    return json({
        status: 'success',
        data: {
            user: {
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata,
                email_confirmed_at: user.email_confirmed_at
            },
            provider_profile: providerProfile,
            provider_error: providerError,
            auth_user: authUser,
            auth_error: authError,
            session_exists: !!session
        }
    });
}; 