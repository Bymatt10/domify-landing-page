import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const body = await request.json();
    console.log('🔧 Creando perfil simple para:', body.email);

    // Verificar autenticación del usuario actual
    const { session, user } = await locals.safeGetSession();
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return json({ 
        error: 'Unauthorized - Admin access required',
        current_user: user?.email || 'none',
        role: user?.user_metadata?.role || 'none'
      }, { status: 401 });
    }

    // Datos de Domus sa (hardcoded para simplicidad)
    const domusData = {
      email: "matthewreyesvanegasma@hotmail.com",
      headline: "Domus sa",
      bio: "ofrecemos servicios de limpieza",
      hourly_rate: 100,
      location: "Estelí",
      phone: "84549735"
    };

    // Primero crear el usuario si no existe
    let targetUserId = null;
    const tempPassword = Math.random().toString(36).slice(-12);

    try {
      const { data: newUser, error: createError } = await locals.supabaseAdmin.auth.admin.createUser({
        email: domusData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          role: 'provider',
          first_name: 'Domus',
          last_name: 'sa'
        }
      });

      if (createError && !createError.message.includes('already registered')) {
        return json({ 
          error: 'Failed to create user', 
          details: createError.message 
        }, { status: 500 });
      }

      if (newUser?.user) {
        targetUserId = newUser.user.id;
      }
    } catch (userError) {
      console.log('Usuario probablemente ya existe, continuando...');
    }

    // Si no pudimos crear el usuario, buscar uno existente
    if (!targetUserId) {
      const { data: existingUsers } = await locals.supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === domusData.email);
      if (existingUser) {
        targetUserId = existingUser.id;
      }
    }

    if (!targetUserId) {
      return json({ error: 'Could not get or create user' }, { status: 500 });
    }

    console.log('👤 Usuario ID:', targetUserId);

    // Ahora crear el perfil de proveedor usando el cliente regular (no admin)
    const { data: profile, error: profileError } = await locals.supabase
      .from('provider_profiles')
      .insert({
        user_id: targetUserId,
        business_name: domusData.headline,
        headline: domusData.headline,
        bio: domusData.bio,
        hourly_rate: domusData.hourly_rate,
        location: domusData.location,
        phone: domusData.phone,
        provider_type: 'individual',
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      return json({ 
        error: 'Failed to create profile', 
        details: profileError.message,
        code: profileError.code,
        user_id: targetUserId
      }, { status: 500 });
    }

    return json({
      success: true,
      message: 'Profile created successfully',
      user_id: targetUserId,
      profile_id: profile.id,
      business_name: profile.business_name,
      temp_password: tempPassword
    });

  } catch (error) {
    console.error('Error en simple-create-profile:', error);
    return json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 