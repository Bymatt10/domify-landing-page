import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    console.log('🔍 Verificando aplicación de Domus sa...');
    
    // Buscar la aplicación de "Domus sa" por email
    const { data: applications, error: appError } = await locals.supabaseAdmin
      .from('provider_applications')
      .select(`
        *,
        categories:provider_application_categories(
          category_id,
          category:categories(name, slug)
        )
      `)
      .ilike('headline', '%domus%')
      .order('created_at', { ascending: false });

    if (appError) {
      return json({
        error: 'Error buscando aplicaciones',
        details: appError.message
      }, { status: 500 });
    }

    // También buscar por email específico
    const { data: emailApp, error: emailError } = await locals.supabaseAdmin
      .from('provider_applications')
      .select(`
        *,
        categories:provider_application_categories(
          category_id,
          category:categories(name, slug)
        )
      `)
      .eq('email', 'matthewreyesvanegasma@hotmail.com')
      .maybeSingle();

    if (emailError && emailError.code !== 'PGRST116') {
      console.error('Error buscando por email:', emailError);
    }

    // Verificar perfiles existentes si hay user_id
    let profilesInfo = [];
    if (applications) {
      for (const app of applications) {
        if (app.user_id) {
          const { data: profile } = await locals.supabaseAdmin
            .from('provider_profiles')
            .select('*')
            .eq('user_id', app.user_id)
            .maybeSingle();
          
          profilesInfo.push({
            application_id: app.id,
            user_id: app.user_id,
            has_profile: !!profile,
            profile: profile
          });
        }
      }
    }

    return json({
      found_by_headline: applications || [],
      found_by_email: emailApp,
      profiles_info: profilesInfo,
      total_found: (applications?.length || 0),
      search_criteria: {
        headline_contains: 'domus',
        email: 'matthewreyesvanegasma@hotmail.com'
      }
    });

  } catch (error) {
    console.error('Error en check-domus-application:', error);
    return json({
      error: 'Error inesperado',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 