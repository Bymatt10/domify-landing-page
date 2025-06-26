import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    console.log('🔧 Forzando creación del perfil de Domus con datos conocidos...');

    // Datos conocidos de la aplicación de Domus del diagnóstico anterior
    const domusData = {
      user_id: '1da75ca1-d7e6-4d47-9301-565361c1344d',
      email: 'matthewreyesvanegasma@hotmail.com',
      headline: 'Domus sa',
      application_id: 3
    };

    const results: any = {
      timestamp: new Date().toISOString(),
      steps: {},
      used_data: domusData
    };

    // Paso 1: Verificar si ya existe un perfil
    try {
      const { data: existingProfile, error: existingError } = await locals.supabaseAdmin
        .from('provider_profiles')
        .select('*')
        .eq('user_id', domusData.user_id)
        .maybeSingle();

      results.steps.check_existing = {
        success: !existingError,
        profile_exists: !!existingProfile,
        data: existingProfile,
        error: existingError?.message
      };

      if (existingProfile) {
        return json({
          success: true,
          message: '✅ El perfil ya existe para Domus sa',
          results,
          existing_profile: existingProfile
        });
      }
    } catch (error) {
      results.steps.check_existing = {
        success: false,
        error: 'Error checking existing profile: ' + (error instanceof Error ? error.message : String(error))
      };
    }

    // Paso 2: Crear el perfil directamente con los datos conocidos
    const profileData = {
      user_id: domusData.user_id,
      business_name: 'Domus sa',
      headline: 'Domus sa',
      bio: 'Servicios profesionales de limpieza residencial y comercial',
      hourly_rate: 100,
      location: 'Estelí, Nicaragua',
      phone: '84549735',
      provider_type: 'individual' as const,
      is_active: true,
      is_verified: false
    };

    try {
      const { data: createdProfile, error: profileError } = await locals.supabaseAdmin
        .from('provider_profiles')
        .insert(profileData)
        .select()
        .single();

      results.steps.create_profile = {
        success: !profileError,
        data: createdProfile,
        error: profileError?.message,
        error_code: profileError?.code,
        profile_data: profileData
      };

      if (createdProfile) {
        // Paso 3: Marcar la aplicación como aprobada (si es posible)
        try {
          const { data: updatedApp, error: updateError } = await locals.supabaseAdmin
            .from('provider_applications')
            .update({ 
              status: 'approved', 
              reviewed_at: new Date().toISOString() 
            })
            .eq('id', domusData.application_id)
            .select()
            .single();

          results.steps.update_application = {
            success: !updateError,
            data: updatedApp,
            error: updateError?.message
          };
        } catch (error) {
          results.steps.update_application = {
            success: false,
            error: 'Error updating application: ' + (error instanceof Error ? error.message : String(error))
          };
        }

        // Paso 4: Asignar categoría de limpieza
        try {
          // Buscar la categoría de limpieza
          const { data: cleaningCategory, error: categoryError } = await locals.supabaseAdmin
            .from('categories')
            .select('id')
            .eq('slug', 'limpieza')
            .single();

          if (cleaningCategory && !categoryError) {
            const { data: categoryAssignment, error: assignError } = await locals.supabaseAdmin
              .from('provider_categories')
              .insert({
                provider_profile_id: createdProfile.id,
                category_id: cleaningCategory.id
              })
              .select()
              .single();

            results.steps.assign_category = {
              success: !assignError,
              data: categoryAssignment,
              error: assignError?.message,
              category_id: cleaningCategory.id
            };
          } else {
            results.steps.assign_category = {
              success: false,
              error: 'Category "limpieza" not found: ' + (categoryError?.message || 'Unknown error')
            };
          }
        } catch (error) {
          results.steps.assign_category = {
            success: false,
            error: 'Error assigning category: ' + (error instanceof Error ? error.message : String(error))
          };
        }

        return json({
          success: true,
          message: '✅ Perfil de Domus creado exitosamente!',
          results,
          created_profile: createdProfile,
          next_steps: [
            'El perfil de proveedor ha sido creado',
            'La aplicación ha sido marcada como aprobada',
            'Se ha asignado la categoría de limpieza',
            'Ahora puedes enviar el email de bienvenida manualmente si es necesario'
          ]
        });
      } else {
        return json({
          success: false,
          message: '❌ No se pudo crear el perfil',
          results,
          error: 'Profile creation returned no data'
        });
      }
    } catch (error) {
      results.steps.create_profile = {
        success: false,
        error: 'Error creating profile: ' + (error instanceof Error ? error.message : String(error))
      };

      return json({
        success: false,
        message: '❌ Error al crear el perfil',
        results,
        recommendations: [
          'Verificar conectividad con Supabase',
          'Verificar que RLS permite la operación',
          'Revisar permisos del service role key'
        ]
      });
    }

  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ locals }) => {
  return json({
    message: 'Endpoint para forzar la creación del perfil de Domus',
    usage: 'POST /api/debug/force-create-domus',
    purpose: 'Crea directamente el perfil usando los datos conocidos de la aplicación de Domus',
    known_data: {
      user_id: '1da75ca1-d7e6-4d47-9301-565361c1344d',
      email: 'matthewreyesvanegasma@hotmail.com',
      headline: 'Domus sa'
    }
  });
}; 