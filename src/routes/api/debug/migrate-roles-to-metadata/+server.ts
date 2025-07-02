import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin';
import { ExceptionHandler } from '$lib/exceptions';

/**
 * Endpoint para migrar roles desde customers a user_metadata
 * Solo para desarrollo/debugging
 */
export const POST: RequestHandler = async ({ request, locals: { supabase }, fetch }) => {
    try {
        // Verificar que el usuario sea admin
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || session.user.user_metadata?.role !== 'admin') {
            return json({ error: 'Acceso denegado. Se requieren permisos de administrador.' }, { status: 403 });
        }

        // Usar el cliente admin directamente
        
        // Paso 1: Obtener todos los usuarios con roles en customers
        const { data: customersWithRoles, error: customersError } = await supabaseAdmin
            .from('customers')
            .select('user_id, role')
            .not('role', 'is', null);

        if (customersError) {
            console.error('Error obteniendo customers con roles:', customersError);
            return json({ error: 'Error obteniendo datos de customers' }, { status: 500 });
        }

        console.log(`Encontrados ${customersWithRoles?.length || 0} usuarios con roles en customers`);

        // Paso 2: Migrar roles a user_metadata
        const migrationResults = [];
        let successCount = 0;
        let errorCount = 0;

        for (const customer of customersWithRoles || []) {
            try {
                // Obtener el usuario actual
                const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(customer.user_id);
                
                if (userError || !user.user) {
                    console.error(`Error obteniendo usuario ${customer.user_id}:`, userError);
                    migrationResults.push({
                        user_id: customer.user_id,
                        status: 'error',
                        error: userError?.message || 'Usuario no encontrado'
                    });
                    errorCount++;
                    continue;
                }

                // Actualizar user_metadata con el rol
                const currentMetadata = user.user.user_metadata || {};
                const updatedMetadata = {
                    ...currentMetadata,
                    role: customer.role
                };

                const { data: updateResult, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                    customer.user_id,
                    { user_metadata: updatedMetadata }
                );

                if (updateError) {
                    console.error(`Error actualizando usuario ${customer.user_id}:`, updateError);
                    migrationResults.push({
                        user_id: customer.user_id,
                        status: 'error',
                        error: updateError.message
                    });
                    errorCount++;
                } else {
                    console.log(`Usuario ${customer.user_id} migrado exitosamente a rol: ${customer.role}`);
                    migrationResults.push({
                        user_id: customer.user_id,
                        status: 'success',
                        role: customer.role
                    });
                    successCount++;
                }

            } catch (error) {
                console.error(`Error procesando usuario ${customer.user_id}:`, error);
                migrationResults.push({
                    user_id: customer.user_id,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
                errorCount++;
            }
        }

        // Paso 3: Asignar rol 'provider' a usuarios con perfiles de proveedor activos
        const { data: providers, error: providersError } = await supabaseAdmin
            .from('provider_profiles')
            .select('user_id')
            .eq('is_active', true);

        if (!providersError && providers) {
            for (const provider of providers) {
                try {
                    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(provider.user_id);
                    
                    if (!userError && user.user) {
                        const currentMetadata = user.user.user_metadata || {};
                        const updatedMetadata = {
                            ...currentMetadata,
                            role: 'provider'
                        };

                        await supabaseAdmin.auth.admin.updateUserById(
                            provider.user_id,
                            { user_metadata: updatedMetadata }
                        );

                        console.log(`Proveedor ${provider.user_id} asignado rol 'provider'`);
                        successCount++;
                    }
                } catch (error) {
                    console.error(`Error asignando rol provider a ${provider.user_id}:`, error);
                    errorCount++;
                }
            }
        }

        // Paso 4: Verificar resultados
        const { data: finalStats } = await supabaseAdmin
            .from('auth.users')
            .select('user_metadata')
            .not('user_metadata->role', 'is', null);

        return json({
            success: true,
            message: 'Migración de roles completada',
            summary: {
                total_processed: customersWithRoles?.length || 0,
                success_count: successCount,
                error_count: errorCount,
                users_with_metadata_roles: finalStats?.length || 0
            },
            details: migrationResults
        });

    } catch (error) {
        console.error('Error en migración de roles:', error);
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};

/**
 * Endpoint para verificar el estado de la migración
 */
export const GET: RequestHandler = async ({ locals: { supabase }, fetch }) => {
    try {
        // Verificar que el usuario sea admin
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || session.user.user_metadata?.role !== 'admin') {
            return json({ error: 'Acceso denegado. Se requieren permisos de administrador.' }, { status: 403 });
        }

        // Usar el cliente admin directamente

        // Verificar usuarios con roles en customers
        const { data: customersWithRoles, error: customersError } = await supabaseAdmin
            .from('customers')
            .select('user_id, role')
            .not('role', 'is', null);

        // Verificar usuarios con roles en user_metadata
        const { data: usersWithMetadataRoles, error: metadataError } = await supabaseAdmin
            .from('auth.users')
            .select('id, user_metadata')
            .not('user_metadata->role', 'is', null);

        // Verificar proveedores activos
        const { data: activeProviders, error: providersError } = await supabaseAdmin
            .from('provider_profiles')
            .select('user_id')
            .eq('is_active', true);

        return json({
            status: 'verificación completada',
            customers_with_roles: customersWithRoles?.length || 0,
            users_with_metadata_roles: usersWithMetadataRoles?.length || 0,
            active_providers: activeProviders?.length || 0,
            migration_needed: (customersWithRoles?.length || 0) > 0,
            details: {
                customers_with_roles: customersWithRoles || [],
                users_with_metadata_roles: usersWithMetadataRoles?.map((u: any) => ({
                    id: u.id,
                    role: u.user_metadata?.role
                })) || [],
                active_providers: activeProviders || []
            }
        });

    } catch (error) {
        console.error('Error verificando migración:', error);
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 