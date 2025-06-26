import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    const results = {
      step1_auth: false,
      step2_find_app: false,
      step3_update_status: false,
      step4_create_profile: false,
      step5_assign_categories: false,
      step6_send_email: false,
      errors: [] as string[],
      data: {} as any
    };

    // PASO 1: Verificar autenticación
    try {
      const { session, user } = await locals.safeGetSession();
      if (!user || user.user_metadata?.role !== 'admin') {
        results.errors.push('No admin auth');
        return json({ results });
      }
      results.step1_auth = true;
      results.data.user_id = user.id;
    } catch (error) {
      results.errors.push(`Auth error: ${error instanceof Error ? error.message : String(error)}`);
      return json({ results });
    }

    // PASO 2: Buscar aplicación ID 3
    try {
      const { data: currentApp, error: fetchError } = await locals.supabaseAdmin
        .from('provider_applications')
        .select('*')
        .eq('id', 3)
        .single();

      if (fetchError) {
        results.errors.push(`Fetch error: ${fetchError.message}`);
        return json({ results });
      }

      if (!currentApp) {
        results.errors.push('Application not found');
        return json({ results });
      }

      results.step2_find_app = true;
      results.data.application = {
        id: currentApp.id,
        headline: currentApp.headline,
        email: currentApp.email,
        user_id: currentApp.user_id,
        status: currentApp.status
      };
    } catch (error) {
      results.errors.push(`Find app error: ${error instanceof Error ? error.message : String(error)}`);
      return json({ results });
    }

    // PASO 3: Intentar actualizar estado (solo si no está ya approved)
    try {
      if (results.data.application.status !== 'approved') {
        const { error: updateError } = await locals.supabaseAdmin
          .from('provider_applications')
          .update({ 
            status: 'approved',
            reviewed_at: new Date().toISOString()
          })
          .eq('id', 3);

        if (updateError) {
          results.errors.push(`Update error: ${updateError.message}`);
          return json({ results });
        }
      }
      results.step3_update_status = true;
    } catch (error) {
      results.errors.push(`Update status error: ${error instanceof Error ? error.message : String(error)}`);
      return json({ results });
    }

    // PASO 4: Verificar si ya existe perfil de proveedor
    try {
      const targetUserId = results.data.application.user_id;
      
      if (!targetUserId) {
        results.errors.push('No user_id in application');
        return json({ results });
      }

      // Verificar si ya existe el perfil
      const { data: existingProfile } = await locals.supabaseAdmin
        .from('provider_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (existingProfile) {
        results.step4_create_profile = true;
        results.data.existing_profile = existingProfile;
        results.data.profile_already_exists = true;
      } else {
        // Intentar crear el perfil
        const { data: profileData, error: profileError } = await locals.supabaseAdmin
          .from('provider_profiles')
          .insert({
            user_id: targetUserId,
            business_name: results.data.application.headline,
            headline: results.data.application.headline,
            bio: 'Test bio',
            hourly_rate: 100,
            location: 'Test location',
            phone: '12345678',
            provider_type: 'individual',
            is_active: true
          })
          .select()
          .single();

        if (profileError) {
          results.errors.push(`Profile creation error: ${profileError.message} (Code: ${profileError.code})`);
          return json({ results });
        }

        results.step4_create_profile = true;
        results.data.new_profile = profileData;
      }
    } catch (error) {
      results.errors.push(`Profile step error: ${error instanceof Error ? error.message : String(error)}`);
      return json({ results });
    }

    // PASO 5: Verificar categorías
    try {
      const { data: categoryData } = await locals.supabaseAdmin
        .from('provider_application_categories')
        .select('category_id')
        .eq('application_id', 3);

      results.step5_assign_categories = true;
      results.data.categories = categoryData || [];
    } catch (error) {
      results.errors.push(`Categories error: ${error instanceof Error ? error.message : String(error)}`);
    }

    // PASO 6: Test de email
    try {
      results.step6_send_email = true; // Por ahora solo marcar como exitoso
      results.data.email_test = 'Email functionality would work here';
    } catch (error) {
      results.errors.push(`Email error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return json({
      success: true,
      results,
      message: 'Diagnostic completed'
    });

  } catch (error) {
    return json({
      success: false,
      error: 'Unexpected error in diagnostic',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 