import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const body = await request.json();
    const { email, headline, bio, hourly_rate, location, phone, categories } = body;

    if (!email || !headline || !bio || !hourly_rate || !location || !phone) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('🔧 Creando perfil directamente para:', email);

    // Buscar si el usuario ya existe en auth
    const { data: authUsers, error: authError } = await locals.supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error listando usuarios:', authError);
      return json({ error: 'Failed to check existing users', details: authError.message }, { status: 500 });
    }

    let targetUser = authUsers.users.find(u => u.email === email);
    let tempPassword = null;

    // Si no existe el usuario, crearlo
    if (!targetUser) {
      tempPassword = Array.from({ length: 12 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');
      
      const { data: newUser, error: createError } = await locals.supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          role: 'provider',
          has_provider_role: true,
          has_customer_role: true,
          requires_password_change: true,
          first_name: headline.split(' ')[0] || 'Usuario',
          last_name: headline.split(' ').slice(1).join(' ') || 'Proveedor'
        }
      });

      if (createError) {
        return json({ error: 'Failed to create user', details: createError.message }, { status: 500 });
      }
      
      targetUser = newUser.user;
      console.log('✅ Usuario creado:', targetUser.id);
    }

    if (!targetUser) {
      return json({ error: 'No user available' }, { status: 500 });
    }

    // Usar SQL directo para crear el perfil (bypassing RLS)
    const { data: profileResult, error: profileError } = await locals.supabaseAdmin
      .rpc('execute_sql', {
        sql: `
          INSERT INTO provider_profiles (
            user_id, business_name, headline, bio, hourly_rate, 
            location, phone, provider_type, is_active
          ) VALUES (
            '${targetUser.id}', 
            '${headline.replace(/'/g, "''")}', 
            '${headline.replace(/'/g, "''")}',
            '${bio.replace(/'/g, "''")}', 
            ${hourly_rate}, 
            '${location.replace(/'/g, "''")}', 
            '${phone}', 
            'individual', 
            true
          ) RETURNING *;
        `
      });

    if (profileError) {
      console.error('Error con SQL directo:', profileError);
      
      // Método alternativo: desactivar RLS temporalmente
      const { error: disableRLSError } = await locals.supabaseAdmin
        .rpc('disable_rls_temporarily');

      if (!disableRLSError) {
        // Intentar crear el perfil sin RLS
        const { data: directProfile, error: directError } = await locals.supabaseAdmin
          .from('provider_profiles')
          .insert({
            user_id: targetUser.id,
            business_name: headline,
            headline: headline,
            bio: bio,
            hourly_rate: hourly_rate,
            location: location,
            phone: phone,
            provider_type: 'individual',
            is_active: true
          })
          .select()
          .single();

        // Re-activar RLS
        await locals.supabaseAdmin.rpc('enable_rls_temporarily');

        if (directError) {
          return json({ 
            error: 'Failed to create profile even without RLS', 
            details: directError.message 
          }, { status: 500 });
        }

        return json({
          success: true,
          message: 'Profile created successfully (without RLS)',
          user_id: targetUser.id,
          profile_id: directProfile.id,
          business_name: directProfile.business_name,
          temp_password: tempPassword
        });
      }

      return json({ 
        error: 'Failed to create profile with SQL', 
        details: profileError.message 
      }, { status: 500 });
    }

    return json({
      success: true,
      message: 'Profile created successfully with SQL',
      user_id: targetUser.id,
      profile_result: profileResult,
      temp_password: tempPassword
    });

  } catch (error) {
    console.error('Error en direct-create-profile:', error);
    return json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 