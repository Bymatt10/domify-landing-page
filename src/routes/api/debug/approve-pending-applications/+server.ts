import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return json({ error: 'Application ID is required' }, { status: 400 });
    }

    console.log('🔧 Aprobando aplicación ID:', applicationId);
    
    // Obtener la aplicación
    const { data: currentApp, error: fetchError } = await locals.supabaseAdmin
      .from('provider_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError || !currentApp) {
      return json({ error: 'Application not found', details: fetchError?.message }, { status: 404 });
    }

    console.log('✅ Aplicación encontrada:', currentApp.headline);

    // Actualizar estado a approved
    const { data: updatedApp, error: updateError } = await locals.supabaseAdmin
      .from('provider_applications')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) {
      return json({ error: 'Failed to update application status', details: updateError.message }, { status: 500 });
    }

    let targetUserId = currentApp.user_id;

    // Si no hay user_id, crear usuario automáticamente
    if (!currentApp.user_id && currentApp.email) {
      const tempPassword = generateTemporaryPassword();
      
      console.log('👤 Creando usuario para:', currentApp.email);
      
      try {
        const { data: newUser, error: createError } = await locals.supabaseAdmin.auth.admin.createUser({
          email: currentApp.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: 'provider',
            has_provider_role: true,
            has_customer_role: true,
            requires_password_change: true,
            first_name: currentApp.headline.split(' ')[0] || 'Usuario',
            last_name: currentApp.headline.split(' ').slice(1).join(' ') || 'Proveedor',
            created_from_application: true,
            application_id: currentApp.id
          }
        });

        if (createError) {
          return json({
            error: 'Error creating user',
            details: createError.message
          }, { status: 500 });
        }

        if (newUser.user) {
          targetUserId = newUser.user.id;
          
          // Actualizar la aplicación con el nuevo user_id
          await locals.supabaseAdmin
            .from('provider_applications')
            .update({ user_id: targetUserId })
            .eq('id', currentApp.id);

          console.log('✅ Usuario creado con ID:', targetUserId);
          console.log('📧 Credenciales temporales - Email:', currentApp.email, 'Password:', tempPassword);
        }
      } catch (userCreationError: any) {
        return json({
          error: 'Failed to create user',
          details: userCreationError.message
        }, { status: 500 });
      }
    }

    // Crear perfil del proveedor usando la conexión admin sin RLS
    if (targetUserId) {
      console.log('👔 Creando perfil de proveedor para user_id:', targetUserId);
      
      // Usar una query SQL raw para evitar problemas de RLS
      const { data: profileData, error: profileError } = await locals.supabaseAdmin.rpc('create_provider_profile', {
        p_user_id: targetUserId,
        p_business_name: currentApp.headline,
        p_headline: currentApp.headline,
        p_bio: currentApp.bio,
        p_hourly_rate: currentApp.hourly_rate,
        p_location: currentApp.location,
        p_phone: currentApp.phone
      });

      if (profileError) {
        console.error('Error creando perfil con RPC:', profileError);
        
        // Intentar crear el perfil directamente como fallback
        try {
          const { data: directProfile, error: directError } = await locals.supabaseAdmin
            .from('provider_profiles')
            .insert({
              user_id: targetUserId,
              business_name: currentApp.headline,
              headline: currentApp.headline,
              bio: currentApp.bio,
              hourly_rate: currentApp.hourly_rate,
              location: currentApp.location,
              phone: currentApp.phone,
              provider_type: 'individual',
              is_active: true
            })
            .select()
            .single();

          if (directError) {
            return json({
              error: 'Failed to create provider profile',
              details: directError.message,
              user_id: targetUserId
            }, { status: 500 });
          }

          console.log('✅ Perfil creado directamente:', directProfile.id);

          // Asignar categorías
          const { data: categoryData } = await locals.supabaseAdmin
            .from('provider_application_categories')
            .select('category_id')
            .eq('application_id', currentApp.id);

          if (categoryData && categoryData.length > 0) {
            const categoryAssignments = categoryData.map((item: any) => ({
              provider_profile_id: directProfile.id,
              category_id: item.category_id
            }));

            await locals.supabaseAdmin
              .from('provider_categories')
              .insert(categoryAssignments);

            console.log('✅ Categorías asignadas:', categoryAssignments.length);
          }

          return json({
            success: true,
            message: 'Application approved and provider profile created',
            user_id: targetUserId,
            profile_id: directProfile.id,
            business_name: directProfile.business_name
          });

        } catch (directCreateError: any) {
          return json({
            error: 'Failed to create provider profile (direct method)',
            details: directCreateError.message,
            user_id: targetUserId
          }, { status: 500 });
        }
      }

      return json({
        success: true,
        message: 'Application approved and provider profile created via RPC',
        user_id: targetUserId,
        profile_data: profileData
      });
    }

    return json({ error: 'No valid user_id available' }, { status: 500 });

  } catch (error) {
    console.error('Error in approve-pending-applications:', error);
    return json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 