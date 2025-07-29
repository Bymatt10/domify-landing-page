import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { tableExists } from '$lib/auth-fixes';

/**
 * @swagger
 * /api/debug/check-tables:
 *   get:
 *     summary: Verificar existencia de tablas en la base de datos
 *     description: Verifica si las tablas principales existen en la BD
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Estado de las tablas
 *       500:
 *         description: Error verificando tablas
 */
export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Verificar tablas principales
    const customersExists = await tableExists(locals.supabase, 'customers');
    const providerProfilesExists = await tableExists(locals.supabase, 'provider_profiles');
    const providersExists = await tableExists(locals.supabase, 'providers');
    const providerApplicationsExists = await tableExists(locals.supabase, 'provider_applications');

    return json({
      tables: {
        customers: customersExists,
        provider_profiles: providerProfilesExists,
        providers: providersExists,
        provider_applications: providerApplicationsExists
      },
      message: 'Verificación de tablas completada'
    });
  } catch (error) {
    console.error('Error verificando tablas:', error);
    return json({ error: 'Error verificando tablas' }, { status: 500 });
  }
};
