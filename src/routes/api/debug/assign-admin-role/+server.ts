import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';

/**
 * Endpoint para asignar rol de admin a un usuario específico
 * Solo para desarrollo/debugging
 */
export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
    try {
        const { email } = await request.json();
        
        if (!email) {
            return json({ error: 'Email es requerido' }, { status: 400 });
        }

        // Verificar que el usuario actual sea admin (o permitir en desarrollo)
        const { data: { session } } = await supabase.auth.getSession();
        const isDevelopment = import.meta.env.DEV;
        
        if (!isDevelopment && (!session || session.user.user_metadata?.role !== 'admin')) {
            return json({ error: 'Acceso denegado. Se requieren permisos de administrador.' }, { status: 403 });
        }

        // Buscar el usuario por email
        const { data: users, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (searchError) {
            console.error('Error buscando usuarios:', searchError);
            return json({ error: 'Error buscando usuarios' }, { status: 500 });
        }

        const targetUser = users.users.find(u => u.email === email);
        
        if (!targetUser) {
            return json({ error: `Usuario con email ${email} no encontrado` }, { status: 404 });
        }

        // Actualizar user_metadata con rol de admin
        const currentMetadata = targetUser.user_metadata || {};
        const updatedMetadata = {
            ...currentMetadata,
            role: 'admin'
        };

        const { data: updateResult, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            targetUser.id,
            { user_metadata: updatedMetadata }
        );

        if (updateError) {
            console.error('Error actualizando usuario:', updateError);
            return json({ error: 'Error actualizando rol de usuario' }, { status: 500 });
        }

        return json({
            success: true,
            message: `Rol de admin asignado exitosamente a ${email}`,
            user: {
                id: targetUser.id,
                email: targetUser.email,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error('Error asignando rol de admin:', error);
        return json({ 
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
};

/**
 * Endpoint para listar todos los usuarios y sus roles
 */
export const GET: RequestHandler = async ({ locals: { supabase } }) => {
    try {
        // Verificar que el usuario actual sea admin (o permitir en desarrollo)
        const { data: { session } } = await supabase.auth.getSession();
        const isDevelopment = import.meta.env.DEV;
        
        if (!isDevelopment && (!session || session.user.user_metadata?.role !== 'admin')) {
            return json({ error: 'Acceso denegado. Se requieren permisos de administrador.' }, { status: 403 });
        }

        // Obtener todos los usuarios
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
            console.error('Error listando usuarios:', listError);
            return json({ error: 'Error listando usuarios' }, { status: 500 });
        }

        // Mapear usuarios con sus roles
        const usersWithRoles = users.users.map(user => ({
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'customer',
            email_confirmed: !!user.email_confirmed_at,
            created_at: user.created_at
        }));

        // Contar por roles
        const roleCounts = {
            admin: usersWithRoles.filter(u => u.role === 'admin').length,
            provider: usersWithRoles.filter(u => u.role === 'provider').length,
            customer: usersWithRoles.filter(u => u.role === 'customer').length,
            no_role: usersWithRoles.filter(u => !u.role || u.role === 'no_role').length
        };

        return json({
            total_users: usersWithRoles.length,
            role_counts: roleCounts,
            users: usersWithRoles
        });

    } catch (error) {
        console.error('Error listando usuarios:', error);
        return json({ 
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}; 