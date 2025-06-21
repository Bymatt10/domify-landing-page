import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    // Obtener todas las aplicaciones aprobadas
    const { data: approvedApps, error: appsError } = await locals.supabaseAdmin
      .from('provider_applications')
      .select(`
        *,
        categories:provider_application_categories(category_id)
      `)
      .eq('status', 'approved');

    if (appsError) {
      return json({
        error: 'Error fetching approved applications',
        details: appsError.message
      }, { status: 500 });
    }

    const results = [];

    for (const app of approvedApps || []) {
      if (!app.user_id) {
        results.push({
          id: app.id,
          status: 'skipped',
          reason: 'No user_id'
        });
        continue;
      }

      // Verificar si ya tiene perfil de proveedor
      const { data: existingProfile } = await locals.supabaseAdmin
        .from('provider_profiles')
        .select('id')
        .eq('user_id', app.user_id)
        .maybeSingle();

      if (existingProfile) {
        results.push({
          id: app.id,
          status: 'exists',
          reason: 'Profile already exists'
        });
        continue;
      }

      // Crear perfil del proveedor
      const { data: profileData, error: profileError } = await locals.supabaseAdmin
        .from('provider_profiles')
        .insert({
          user_id: app.user_id,
          business_name: app.headline,
          description: app.bio,
          hourly_rate: app.hourly_rate,
          location: app.location,
          phone: app.phone,
          provider_type: 'individual',
          is_active: true
        })
        .select()
        .single();

      if (profileError) {
        results.push({
          id: app.id,
          status: 'error',
          reason: profileError.message
        });
        continue;
      }

      // Asignar categorías
      if (app.categories && app.categories.length > 0) {
        const categoryAssignments = app.categories.map((cat: any) => ({
          provider_profile_id: profileData.id,
          category_id: cat.category_id
        }));

        const { error: categoryError } = await locals.supabaseAdmin
          .from('provider_categories')
          .insert(categoryAssignments);

        if (categoryError) {
          console.error('Error assigning categories:', categoryError);
        }
      }

      results.push({
        id: app.id,
        status: 'created',
        profileId: profileData.id,
        categories: app.categories?.length || 0
      });
    }

    return json({
      success: true,
      message: 'Migration completed',
      results: results,
      summary: {
        total: results.length,
        created: results.filter(r => r.status === 'created').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        existing: results.filter(r => r.status === 'exists').length,
        errors: results.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    return json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 