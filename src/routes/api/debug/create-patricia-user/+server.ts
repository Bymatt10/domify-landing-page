import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { sendWelcomeEmail, generateTemporaryPassword, type WelcomeEmailData } from '$lib/email.js';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    const email = 'patriciavanegas@gmail.com';
    const providerName = 'Patricia Vanegas';
    
    // Generar contraseña temporal
    const tempPassword = generateTemporaryPassword();
    
    console.log('🚀 Creando usuario para Patricia...');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña temporal: ${tempPassword}`);
    
    // Crear usuario en Supabase Auth
    const { data: newUser, error: createError } = await locals.supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: 'provider',
        has_provider_role: true,
        has_customer_role: true,
        requires_password_change: true,
        first_name: 'Patricia',
        last_name: 'Vanegas',
        created_from_application: true,
        application_id: 2
      }
    });

    if (createError) {
      return json({
        error: 'Error creando usuario',
        details: createError.message
      }, { status: 500 });
    }

    if (!newUser.user) {
      return json({
        error: 'No se pudo crear el usuario'
      }, { status: 500 });
    }

    console.log('✅ Usuario creado exitosamente:', newUser.user.id);

    // Intentar actualizar la aplicación (opcional, no fallar si no funciona)
    try {
      await locals.supabaseAdmin
        .from('provider_applications')
        .update({ user_id: newUser.user.id })
        .eq('email', email);
      console.log('✅ Aplicación actualizada con user_id');
    } catch (updateError) {
      console.log('⚠️ No se pudo actualizar la aplicación, pero el usuario fue creado');
    }

    // Crear perfil de customer
    try {
      const { error: customerError } = await locals.supabaseAdmin
        .from('customers')
        .insert({
          user_id: newUser.user.id,
          first_name: 'Patricia',
          last_name: 'Vanegas',
          phone_number: '86891823',
          role: 'customer'
        });

      if (customerError) {
        console.log('⚠️ Error creando perfil de customer:', customerError.message);
      } else {
        console.log('✅ Perfil de customer creado');
      }
    } catch (err) {
      console.log('⚠️ Error en perfil de customer:', err);
    }

    // Crear perfil de proveedor
    try {
      const { data: profileData, error: profileError } = await locals.supabaseAdmin
        .from('provider_profiles')
        .insert({
          user_id: newUser.user.id,
          business_name: 'Servicio de Limpieza Patricia',
          description: 'Soy el mejor de limpieza - el mero mero',
          hourly_rate: 150,
          location: 'Managua',
          phone: '86891823',
          provider_type: 'individual',
          is_active: true
        })
        .select()
        .single();

      if (profileError) {
        console.log('⚠️ Error creando perfil de proveedor:', profileError.message);
      } else {
        console.log('✅ Perfil de proveedor creado:', profileData.id);
        
        // Asignar categoría de limpieza (ID 2)
        try {
          const { error: categoryError } = await locals.supabaseAdmin
            .from('provider_categories')
            .insert({
              provider_profile_id: profileData.id,
              category_id: 2 // Montaje/Limpieza
            });

          if (categoryError) {
            console.log('⚠️ Error asignando categoría:', categoryError.message);
          } else {
            console.log('✅ Categoría asignada');
          }
        } catch (catErr) {
          console.log('⚠️ Error en categoría:', catErr);
        }
      }
    } catch (err) {
      console.log('⚠️ Error en perfil de proveedor:', err);
    }

    // Enviar email de bienvenida
    try {
      const emailData: WelcomeEmailData = {
        email: email,
        name: providerName,
        tempPassword: tempPassword,
        loginUrl: `http://localhost:5173/auth/login`
      };

      await sendWelcomeEmail(emailData);
      console.log('✅ Email de bienvenida enviado');
    } catch (emailError) {
      console.log('⚠️ Error enviando email:', emailError);
    }

    return json({
      success: true,
      message: 'Usuario creado exitosamente para Patricia',
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        tempPassword: tempPassword
      },
      instructions: [
        '1. Ve a http://localhost:5173/auth/login',
        `2. Usa el email: ${email}`,
        `3. Usa la contraseña temporal: ${tempPassword}`,
        '4. Te pedirá cambiar la contraseña',
        '5. ¡Listo! Tendrás acceso como provider y customer'
      ],
      loginUrl: 'http://localhost:5173/auth/login'
    });

  } catch (error) {
    console.error('💥 Error general:', error);
    return json({
      error: 'Error inesperado',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 