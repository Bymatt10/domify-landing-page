import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    console.log('🔧 Verificando y arreglando permisos RLS para provider_profiles...');

    const results: any = {
      timestamp: new Date().toISOString(),
      steps: {}
    };

    // Paso 1: Intentar obtener la aplicación ID 3
    try {
      const { data: appData, error: appError } = await locals.supabaseAdmin
        .from('provider_applications')
        .select('*')
        .eq('id', 3)
        .single();

      if (appError || !appData) {
        throw new Error('No se pudo encontrar la aplicación ID 3');
      }

      results.steps.get_application = {
        success: true,
        data: appData
      };

      // Paso 2: Verificar si ya existe un perfil para este usuario
      const { data: existingProfile, error: existingError } = await locals.supabaseAdmin
        .from('provider_profiles')
        .select('*')
        .eq('user_id', appData.user_id)
        .single();

      results.steps.check_existing_profile = {
        success: !existingError || existingError.code === 'PGRST116', // PGRST116 = no rows found
        data: existingProfile,
        error: existingError?.message,
        profile_exists: !!existingProfile
      };

      // Paso 3: Si no existe perfil, intentar crearlo con diferentes métodos
      if (!existingProfile) {
        const profileData = {
          user_id: appData.user_id,
          business_name: appData.headline,
          headline: appData.headline,
          bio: appData.bio || 'Proveedor de servicios profesionales',
          hourly_rate: appData.hourly_rate || 100,
          location: appData.location || 'Estelí, Nicaragua',
          phone: appData.phone || '',
          provider_type: 'individual' as const,
          is_active: true,
          is_verified: false
        };

        // Método 1: Usar supabaseAdmin normal
        const { data: createdProfile1, error: profileError1 } = await locals.supabaseAdmin
          .from('provider_profiles')
          .insert(profileData)
          .select()
          .single();

        results.steps.create_profile_method1 = {
          success: !profileError1,
          data: createdProfile1,
          error: profileError1?.message,
          error_code: profileError1?.code,
          attempted_data: profileData
        };

        // Si el primer método falló, intentar método 2: Usar context bypass
        if (profileError1) {
          try {
            // Usar SQL directo para bypass RLS temporalmente
            const { data: createdProfile2, error: profileError2 } = await locals.supabaseAdmin
              .rpc('create_provider_profile_admin', {
                p_user_id: appData.user_id,
                p_business_name: appData.headline,
                p_headline: appData.headline,
                p_bio: appData.bio || 'Proveedor de servicios profesionales',
                p_hourly_rate: appData.hourly_rate || 100,
                p_location: appData.location || 'Estelí, Nicaragua',
                p_phone: appData.phone || '',
                p_provider_type: 'individual',
                p_is_active: true,
                p_is_verified: false
              });

            results.steps.create_profile_method2 = {
              success: !profileError2,
              data: createdProfile2,
              error: profileError2?.message,
              error_code: profileError2?.code
            };
          } catch (rpcError) {
            results.steps.create_profile_method2 = {
              success: false,
              error: 'RPC function not available',
              rpc_error: rpcError instanceof Error ? rpcError.message : String(rpcError)
            };
          }
        }
      }

    } catch (error) {
      results.steps.general_error = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return json({
      success: true,
      message: 'Diagnóstico de RLS completado',
      results,
      next_steps: [
        'Si todos los métodos fallaron con error 42501, el problema es RLS',
        'Puede necesitar deshabilitar RLS temporalmente en provider_profiles',
        'O crear una función SQL que bypasse RLS para admins'
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
    message: 'Endpoint para diagnosticar y arreglar permisos RLS en provider_profiles',
    usage: 'POST /api/debug/fix-rls-permissions',
    purpose: 'Diagnostica problemas de Row Level Security que impiden crear perfiles de proveedor'
  });
}; 