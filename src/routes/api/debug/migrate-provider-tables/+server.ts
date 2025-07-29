import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { tableExists } from '$lib/auth-fixes';

/**
 * @swagger
 * /api/debug/migrate-provider-tables:
 *   post:
 *     summary: Migrar datos entre tablas de proveedores
 *     description: Migra datos de la tabla 'providers' a 'provider_profiles' si es necesario
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Migración completada
 *       500:
 *         description: Error en la migración
 */
export const POST: RequestHandler = async ({ locals }) => {
  try {
    // Verificar si existen ambas tablas
    const providersExists = await tableExists(locals.supabase, 'providers');
    const profilesExists = await tableExists(locals.supabase, 'provider_profiles');

    if (!providersExists) {
      return json({
        message: 'La tabla providers no existe, no se requiere migración',
        action: 'none'
      });
    }

    if (!profilesExists) {
      return json({
        message: 'La tabla provider_profiles no existe, crea esta tabla primero',
        action: 'create_table',
        error: true
      }, { status: 400 });
    }

    // Obtener datos de la tabla antigua si existe
    const { data: providers, error: fetchError } = await locals.supabase
      .from('providers')
      .select('*');

    if (fetchError) {
      return json({
        message: 'Error obteniendo datos de providers',
        error: fetchError
      }, { status: 500 });
    }

    if (!providers || providers.length === 0) {
      return json({
        message: 'No hay datos para migrar en la tabla providers',
        migrated: 0
      });
    }

    // Migrar cada registro
    const results = [];
    for (const provider of providers) {
      // Verificar si ya existe en provider_profiles
      const { data: existing } = await locals.supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', provider.user_id)
        .maybeSingle();

      if (existing) {
        results.push({
          user_id: provider.user_id,
          status: 'skipped',
          reason: 'already_exists'
        });
        continue;
      }

      // Crear en la nueva tabla
      const { data: newProfile, error: insertError } = await locals.supabase
        .from('provider_profiles')
        .insert({
          user_id: provider.user_id,
          business_name: provider.business_name || provider.first_name + ' ' + provider.last_name,
          description: provider.description || '',
          hourly_rate: provider.hourly_rate || 0,
          phone: provider.phone || '',
          location: provider.location || '',
          rating: provider.rating || 0,
          total_reviews: provider.total_reviews || 0,
          is_verified: provider.is_verified || false,
          is_active: provider.is_active || true,
          created_at: provider.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        results.push({
          user_id: provider.user_id,
          status: 'error',
          error: insertError
        });
      } else {
        results.push({
          user_id: provider.user_id,
          status: 'migrated',
          new_id: newProfile.id
        });
      }
    }

    const migrated = results.filter(r => r.status === 'migrated').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    return json({
      message: `Migración completada: ${migrated} migrados, ${skipped} omitidos, ${errors} errores`,
      results,
      summary: { migrated, skipped, errors, total: providers.length }
    });
  } catch (error) {
    console.error('Error en migración de tablas:', error);
    return json({ 
      error: 'Error inesperado en migración', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
};
