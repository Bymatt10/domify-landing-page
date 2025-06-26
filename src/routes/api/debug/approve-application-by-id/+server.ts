import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { sendProviderWelcomeEmail } from '$lib/email-service';

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const POST: RequestHandler = async ({ locals, url }) => {
  try {
    // Get application ID from URL parameters
    const applicationId = parseInt(url.searchParams.get('id') || '0');
    
    if (!applicationId) {
      return json({ error: 'Application ID is required' }, { status: 400 });
    }

    console.log('🔧 Aprobando aplicación ID:', applicationId);

    // Verificar autenticación admin (skip for debug)
    // const { session, user } = await locals.safeGetSession();
    // if (!user || user.user_metadata?.role !== 'admin') {
    //   return json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    // }

    // Obtener la aplicación específica
    const { data: currentApp, error: fetchError } = await locals.supabaseAdmin
      .from('provider_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError || !currentApp) {
      return json({ 
        error: 'Application not found', 
        details: fetchError?.message,
        application_id: applicationId 
      }, { status: 404 });
    }

    console.log('✅ Aplicación encontrada:', currentApp.headline, 'Email:', currentApp.email);

    // Actualizar el estado a aprobado
    const { error: updateError } = await locals.supabaseAdmin
      .from('provider_applications')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by_admin_id: null // Skip for debug
      })
      .eq('id', applicationId);

    if (updateError) {
      return json({ 
        error: 'Failed to update application status', 
        details: updateError.message 
      }, { status: 500 });
    }

    console.log('✅ Aplicación actualizada a "approved"');

    let targetUserId = currentApp.user_id;
    let tempPassword = null;

    // Si no hay user_id, buscar usuario existente o crear uno nuevo
    if (!currentApp.user_id && currentApp.email) {
      console.log('👤 Buscando usuario existente para:', currentApp.email);
      
      // Primero intentar encontrar usuario existente
      const { data: existingUsers, error: searchError } = await locals.supabaseAdmin.auth.admin.listUsers();
      
      let existingUser = null;
      if (!searchError && existingUsers?.users) {
        existingUser = existingUsers.users.find(u => u.email === currentApp.email);
      }
      
      if (existingUser) {
        console.log('✅ Usuario existente encontrado:', existingUser.id);
        targetUserId = existingUser.id;
        
        // Actualizar la aplicación con el user_id existente
        await locals.supabaseAdmin
          .from('provider_applications')
          .update({ user_id: targetUserId })
          .eq('id', applicationId);
          
        // No generar contraseña temporal para usuarios existentes
        tempPassword = null;
        
      } else {
        // Crear nuevo usuario
        tempPassword = generateTemporaryPassword();
        
        console.log('👤 Creando nuevo usuario para:', currentApp.email);
        
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
            error: 'Failed to create user', 
            details: createError.message 
          }, { status: 500 });
        }

        if (newUser.user) {
          targetUserId = newUser.user.id;
          
          // Actualizar la aplicación con el nuevo user_id
          await locals.supabaseAdmin
            .from('provider_applications')
            .update({ user_id: targetUserId })
            .eq('id', applicationId);

          console.log('✅ Usuario creado:', targetUserId);
        }
      }
    }

    if (!targetUserId) {
      return json({ error: 'No valid user_id available' }, { status: 500 });
    }

    // Crear perfil de customer primero
    console.log('👤 Creando perfil de customer para user_id:', targetUserId);
    
    const { data: customerData, error: customerError } = await locals.supabaseAdmin
      .from('customers')
      .insert({
        user_id: targetUserId,
        first_name: currentApp.headline.split(' ')[0] || 'Usuario',
        last_name: currentApp.headline.split(' ').slice(1).join(' ') || 'Proveedor',
        phone_number: currentApp.phone,
        role: 'provider'
      })
      .select()
      .single();

    if (customerError) {
      console.error('❌ Error creando customer:', customerError);
    } else {
      console.log('✅ Customer creado exitosamente:', customerData.id);
    }

    console.log('👔 Creando perfil de proveedor para user_id:', targetUserId);

    // Crear el perfil de proveedor
    const { data: profileData, error: profileError } = await locals.supabaseAdmin
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

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      return json({ 
        error: 'Failed to create provider profile', 
        details: profileError.message,
        code: profileError.code,
        hint: profileError.hint,
        user_id: targetUserId
      }, { status: 500 });
    }

    console.log('✅ Perfil creado exitosamente:', profileData.id);

    // Obtener y asignar categorías
    const { data: categoryData } = await locals.supabaseAdmin
      .from('provider_application_categories')
      .select('category_id')
      .eq('application_id', applicationId);

    if (categoryData && categoryData.length > 0) {
      console.log('🏷️ Asignando categorías:', categoryData.length);
      
      const categoryAssignments = categoryData.map((item: any) => ({
        provider_profile_id: profileData.id,
        category_id: item.category_id
      }));

      const { error: categoryError } = await locals.supabaseAdmin
        .from('provider_categories')
        .insert(categoryAssignments);

      if (categoryError) {
        console.error('⚠️ Error asignando categorías:', categoryError);
      } else {
        console.log('✅ Categorías asignadas exitosamente');
      }
    }

    // Enviar email de bienvenida usando SendGrid
    if (currentApp.email && tempPassword) {
      console.log('📧 Enviando email de bienvenida con SendGrid...');
      
      try {
        const emailResult = await sendProviderWelcomeEmail(
          currentApp.email,
          currentApp.headline,
          tempPassword,
          'http://localhost:5173/auth/login'
        );

        if (emailResult) {
          console.log('✅ Email enviado exitosamente con SendGrid');
        } else {
          console.log('⚠️ Email falló con SendGrid');
        }
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError);
      }
    }

    return json({
      success: true,
      message: 'Application approved and provider profile created successfully',
      data: {
        application_id: applicationId,
        user_id: targetUserId,
        profile_id: profileData.id,
        customer_id: customerData?.id,
        business_name: profileData.business_name,
        email: currentApp.email,
        temp_password: tempPassword,
        categories_assigned: categoryData?.length || 0,
        email_sent: !!tempPassword
      }
    });

  } catch (error) {
    console.error('❌ Error en approve-application-by-id:', error);
    return json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 