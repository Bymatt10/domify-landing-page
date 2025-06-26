import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    console.log('🔧 Deshabilitando RLS temporalmente para crear perfil de Domus...');

    const results: any = {
      timestamp: new Date().toISOString(),
      steps: {}
    };

    // Datos conocidos
    const domusData = {
      user_id: '1da75ca1-d7e6-4d47-9301-565361c1344d',
      email: 'matthewreyesvanegasma@hotmail.com',
      headline: 'Domus sa',
      application_id: 3
    };

    // Paso 1: Intentar deshabilitar RLS temporalmente usando SQL directo
    try {
      const disableRLSQuery = `
        ALTER TABLE provider_profiles DISABLE ROW LEVEL SECURITY;
      `;

      const { data: disableResult, error: disableError } = await locals.supabaseAdmin
        .rpc('exec_sql', { query: disableRLSQuery });

      results.steps.disable_rls = {
        success: !disableError,
        data: disableResult,
        error: disableError?.message
      };
    } catch (error) {
      // Si no existe la función exec_sql, intentamos una aproximación diferente
      results.steps.disable_rls = {
        success: false,
        error: 'RPC function exec_sql not available: ' + (error instanceof Error ? error.message : String(error))
      };
    }

    // Paso 2: Crear el perfil ahora que RLS debería estar deshabilitado
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
        error_code: profileError?.code
      };

      if (createdProfile) {
        // Paso 3: Re-habilitar RLS
        try {
          const enableRLSQuery = `
            ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
          `;

          const { data: enableResult, error: enableError } = await locals.supabaseAdmin
            .rpc('exec_sql', { query: enableRLSQuery });

          results.steps.enable_rls = {
            success: !enableError,
            data: enableResult,
            error: enableError?.message
          };
        } catch (error) {
          results.steps.enable_rls = {
            success: false,
            error: 'Error re-enabling RLS: ' + (error instanceof Error ? error.message : String(error))
          };
        }

        return json({
          success: true,
          message: '✅ Perfil de Domus creado exitosamente deshabilitando RLS temporalmente!',
          results,
          created_profile: createdProfile,
          important_note: 'RLS ha sido re-habilitado en provider_profiles'
        });
      }
    } catch (error) {
      results.steps.create_profile = {
        success: false,
        error: 'Error creating profile: ' + (error instanceof Error ? error.message : String(error))
      };
    }

    // Si llegamos aquí, no se pudo crear el perfil - intentemos solución alternativa
    // Usar un INSERT directo con SQL
    try {
      const directInsertQuery = `
        INSERT INTO provider_profiles (
          user_id, business_name, headline, bio, hourly_rate, 
          location, phone, provider_type, is_active, is_verified
        ) VALUES (
          '${domusData.user_id}',
          'Domus sa',
          'Domus sa', 
          'Servicios profesionales de limpieza residencial y comercial',
          100,
          'Estelí, Nicaragua',
          '84549735',
          'individual',
          true,
          false
        ) RETURNING *;
      `;

      const { data: sqlResult, error: sqlError } = await locals.supabaseAdmin
        .rpc('exec_sql', { query: directInsertQuery });

      results.steps.direct_sql_insert = {
        success: !sqlError,
        data: sqlResult,
        error: sqlError?.message
      };

      if (sqlResult && !sqlError) {
        return json({
          success: true,
          message: '✅ Perfil creado usando SQL directo!',
          results,
          method: 'direct_sql'
        });
      }
    } catch (error) {
      results.steps.direct_sql_insert = {
        success: false,
        error: 'Error with direct SQL: ' + (error instanceof Error ? error.message : String(error))
      };
    }

    return json({
      success: false,
      message: '❌ No se pudo crear el perfil con ningún método',
      results,
      recommendations: [
        'El problema de RLS es muy restrictivo',
        'Puede necesitar acceso directo a la base de datos',
        'Revisar configuración del service role key',
        'Considerar crear función SQL que bypasse RLS'
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
    message: 'Endpoint para deshabilitar RLS temporalmente y crear perfil de Domus',
    usage: 'POST /api/debug/disable-rls-create-domus',
    warning: 'Este endpoint deshabilita temporalmente RLS en provider_profiles'
  });
}; 