import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    console.log('🔍 Verificando perfil de Patricia...');
    
    // Buscar el usuario en auth
    const { data: authUsers, error: authError } = await locals.supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      return json({ error: 'Error obteniendo usuarios de auth', details: authError.message }, { status: 500 });
    }
    
    const patriciaAuth = authUsers.users.find(u => u.email === 'patriciavanegas@gmail.com');
    
    if (!patriciaAuth) {
      return json({ error: 'Usuario de Patricia no encontrado en auth' }, { status: 404 });
    }
    
    console.log('✅ Usuario auth encontrado:', patriciaAuth.id);
    
    // Verificar perfil de customer
    const { data: customerProfile, error: customerError } = await locals.supabaseAdmin
      .from('customers')
      .select('*')
      .eq('user_id', patriciaAuth.id)
      .maybeSingle();
    
    console.log('Customer profile:', customerProfile, customerError);
    
    // Verificar perfil de proveedor
    const { data: providerProfile, error: providerError } = await locals.supabaseAdmin
      .from('provider_profiles')
      .select(`
        *,
        categories:provider_categories(
          category_id,
          category:categories(name, slug)
        )
      `)
      .eq('user_id', patriciaAuth.id)
      .maybeSingle();
    
    console.log('Provider profile:', providerProfile, providerError);
    
    // Verificar aplicación
    const { data: application, error: appError } = await locals.supabaseAdmin
      .from('provider_applications')
      .select('*')
      .eq('email', 'patriciavanegas@gmail.com')
      .maybeSingle();
    
    console.log('Application:', application, appError);
    
    return json({
      success: true,
      user: {
        id: patriciaAuth.id,
        email: patriciaAuth.email,
        user_metadata: patriciaAuth.user_metadata,
        email_confirmed_at: patriciaAuth.email_confirmed_at,
        created_at: patriciaAuth.created_at
      },
      profiles: {
        customer: customerProfile || null,
        provider: providerProfile || null
      },
      application: application || null,
      errors: {
        customer: customerError?.message || null,
        provider: providerError?.message || null,
        application: appError?.message || null
      }
    });
    
  } catch (error) {
    console.error('💥 Error:', error);
    return json({
      error: 'Error inesperado',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 