import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';

export const GET: RequestHandler = async ({ locals }) => {
    const { user } = await locals.safeGetSession();

    if (!user) {
        return json({
            status: 'error',
            message: 'No user authenticated',
            data: null
        });
    }

    // Update user metadata to include provider role
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
            user_metadata: {
                ...user.user_metadata,
                role: 'provider'
            }
        }
    );

    if (updateError) {
        return json({
            status: 'error',
            message: 'Failed to update user role',
            error: updateError
        });
    }

    // Invalidate all server-side sessions to force a refresh
    const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(user.id, 'global');

    return json({
        status: 'success',
        message: 'Provider role added successfully. Please sign out and sign in again.',
        data: {
            updated_user: updatedUser,
            metadata: updatedUser?.user?.user_metadata,
            sign_out_error: signOutError
        }
    });
}; 