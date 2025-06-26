import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    console.log('🔧 Intentando crear perfil para Domus sa...');

    const results: any = {
      timestamp: new Date().toISOString(),
      steps: {},
      final_success: false
    };

    // Paso 1: Buscar la aplicación de Domus usando diferentes métodos
    let domusApplication = null;
    
    // Método 1: Buscar por email usando supabaseAdmin
    try {
      const { data: appByEmail, error: emailError } = await locals.supabaseAdmin
        .from('provider_applications')
        .select('*')
        .eq('email', 'matthewreyesvanegasma@hotmail.com')
        .single();

      results.steps.find_by_email = {
        success: !emailError,
        data: appByEmail,
        error: emailError?.message
      };

      if (appByEmail) domusApplication = appByEmail;
    } catch (error) {
      results.steps.find_by_email = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Método 2: Buscar por headline si el email falló
    if (!domusApplication) {
      try {
        const { data: appByHeadline, error: headlineError } = await locals.supabaseAdmin
          .from('provider_applications')
          .select('*')
          .ilike('headline', '%Domus%')
          .single();

        results.steps.find_by_headline = {
          success: !headlineError,
          data: appByHeadline,
          error: headlineError?.message
        };

        if (appByHeadline) domusApplication = appByHeadline;
      } catch (error) {
        results.steps.find_by_headline = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Método 3: Listar todas las aplicaciones si los anteriores fallaron
    if (!domusApplication) {
      try {
        const { data: allApps, error: allError } = await locals.supabaseAdmin
          .from('provider_applications')
          .select('*')
          .limit(20);

        results.steps.list_all_applications = {
          success: !allError,
          data: allApps,
          error: allError?.message,
          count: allApps?.length || 0
        };

        if (allApps && allApps.length > 0) {
          // Buscar Domus manualmente
          domusApplication = allApps.find(app => 
            app.email === 'matthewreyesvanegasma@hotmail.com' ||
            (app.headline && app.headline.toLowerCase().includes('domus'))
          );
        }
      } catch (error) {
        results.steps.list_all_applications = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    if (!domusApplication) {
      return json({
        success: false,
        message: 'No se pudo encontrar la aplicación de Domus sa',
        results
      });
    }

    results.found_application = domusApplication;

    // Paso 2: Verificar si ya existe un perfil
    try {
      const { data: existingProfile, error: existingError } = await locals.supabaseAdmin
        .from('provider_profiles')
        .select('*')
        .eq('user_id', domusApplication.user_id)
        .single();

      results.steps.check_existing_profile = {
        success: !existingError || existingError.code === 'PGRST116',
        data: existingProfile,
        error: existingError?.message,
        profile_exists: !!existingProfile
      };

      if (existingProfile) {
        return json({
          success: true,
          message: 'El perfil ya existe para Domus sa',
          results,
          existing_profile: existingProfile
        });
      }
    } catch (error) {
      results.steps.check_existing_profile = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Paso 3: Crear el perfil usando diferentes métodos
    const profileData = {
      user_id: domusApplication.user_id,
      business_name: domusApplication.headline || 'Domus sa',
      headline: domusApplication.headline || 'Domus sa',
      bio: domusApplication.bio || 'Servicios profesionales de limpieza',
      hourly_rate: domusApplication.hourly_rate || 100,
      location: domusApplication.location || 'Estelí, Nicaragua',
      phone: domusApplication.phone || '84549735',
      provider_type: 'individual' as const,
      is_active: true,
      is_verified: false
    };

    // Método 1: Usar supabaseAdmin directo
    try {
      const { data: createdProfile1, error: profileError1 } = await locals.supabaseAdmin
        .from('provider_profiles')
        .insert(profileData)
        .select()
        .single();

      results.steps.create_profile_admin = {
        success: !profileError1,
        data: createdProfile1,
        error: profileError1?.message,
        error_code: profileError1?.code
      };

      if (createdProfile1) {
        results.final_success = true;
        results.created_profile = createdProfile1;

        // Marcar la aplicación como aprobada si no lo está
        if (domusApplication.status !== 'approved') {
          await locals.supabaseAdmin
            .from('provider_applications')
            .update({ status: 'approved', reviewed_at: new Date().toISOString() })
            .eq('id', domusApplication.id);
        }

        return json({
          success: true,
          message: '✅ Perfil creado exitosamente para Domus sa',
          results,
          profile: createdProfile1
        });
      }
    } catch (error) {
      results.steps.create_profile_admin = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Método 2: Usar el cliente regular con admin auth
    try {
      const { data: createdProfile2, error: profileError2 } = await locals.supabase
        .from('provider_profiles')
        .insert(profileData)
        .select()
        .single();

      results.steps.create_profile_regular = {
        success: !profileError2,
        data: createdProfile2,
        error: profileError2?.message,
        error_code: profileError2?.code
      };

      if (createdProfile2) {
        results.final_success = true;
        results.created_profile = createdProfile2;

        return json({
          success: true,
          message: '✅ Perfil creado exitosamente usando cliente regular',
          results,
          profile: createdProfile2
        });
      }
    } catch (error) {
      results.steps.create_profile_regular = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Si llegamos aquí, ningún método funcionó
    return json({
      success: false,
      message: '❌ No se pudo crear el perfil con ningún método',
      results,
      recommendations: [
        'Verificar que SUPABASE_SERVICE_ROLE_KEY esté configurado correctamente',
        'Revisar que las políticas RLS permitan la operación',
        'Considerar deshabilitar temporalmente RLS en provider_profiles'
      ]
    });

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
    message: 'Endpoint para crear el perfil de proveedor para Domus sa',
    usage: 'POST /api/debug/create-domus-profile',
    purpose: 'Encuentra la aplicación de Domus sa y crea su perfil de proveedor'
  });
}; 