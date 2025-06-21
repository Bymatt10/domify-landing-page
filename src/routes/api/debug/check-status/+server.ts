import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/debug/check-status:
 *   get:
 *     summary: Check system status
 *     description: Check authentication status and database record counts
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: System status retrieved successfully
 *       500:
 *         description: Error checking system status
 */
export const GET: RequestHandler = async ({ locals }) => {
  try {
    const { session, user } = await locals.safeGetSession();
    
    // Check provider applications count
    const { data: applications, error: appsError } = await locals.supabase
      .from('provider_applications')
      .select('count', { count: 'exact', head: true });

    // Check customers count
    const { data: customers, error: customersError } = await locals.supabase
      .from('customers')
      .select('count', { count: 'exact', head: true });

    // Check provider profiles count
    const { data: providers, error: providersError } = await locals.supabase
      .from('provider_profiles')
      .select('count', { count: 'exact', head: true });

    return json({
      authenticated: !!session,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role
      } : null,
      database: {
        applications: {
          count: applications?.length || 0,
          error: appsError?.message
        },
        customers: {
          count: customers?.length || 0,
          error: customersError?.message
        },
        providers: {
          count: providers?.length || 0,
          error: providersError?.message
        }
      }
    });

  } catch (error) {
    console.error('Error in check-status endpoint:', error);
    return json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 