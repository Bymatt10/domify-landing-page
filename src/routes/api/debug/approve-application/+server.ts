import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

// Función para generar contraseña temporal
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const POST: RequestHandler = async ({ locals }) => {
  try {
    // Obtener la aplicación específica de Patricia
    const { data: application, error: appError } = await locals.supabaseAdmin
      .from('provider_applications')
      .select(`
        *,
        categories:provider_application_categories(category_id)
      `)
      .eq('email', 'patriciavanegas@gmail.com')
      .eq('status', 'approved')
      .maybeSingle();

    if (appError || !application) {
      return json({
        error: 'No se encontró la aplicación de Patricia o no está aprobada',
        details: appError?.message
      }, { status: 404 });
    }

    if (application.user_id) {
      return json({
        error: 'La aplicación ya tiene user_id asignado',
        user_id: application.user_id
      }, { status: 400 });
    }

    // Generar contraseña temporal
    const tempPassword = generateTemporaryPassword();
    
    // Crear usuario en Supabase Auth
    const { data: newUser, error: createError } = await locals.supabaseAdmin.auth.admin.createUser({
      email: application.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: 'provider',
        has_provider_role: true,
        has_customer_role: true,
        requires_password_change: true,
        first_name: application.headline.split(' ')[0] || 'Patricia',
        last_name: application.headline.split(' ').slice(1).join(' ') || 'Vanegas',
        created_from_application: true,
        application_id: application.id
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

    // Actualizar la aplicación con el nuevo user_id
    await locals.supabaseAdmin
      .from('provider_applications')
      .update({ user_id: newUser.user.id })
      .eq('id', application.id);

    // Crear perfil de customer
    const { error: customerError } = await locals.supabaseAdmin
      .from('customers')
      .insert({
        user_id: newUser.user.id,
        first_name: 'Patricia',
        last_name: 'Vanegas',
        phone_number: application.phone,
        role: 'customer'
      });

    if (customerError) {
      console.error('Error creating customer profile:', customerError);
    }

    // Crear perfil de proveedor
    const { data: profileData, error: profileError } = await locals.supabaseAdmin
      .from('provider_profiles')
      .insert({
        user_id: newUser.user.id,
        business_name: application.headline,
        description: application.bio,
        hourly_rate: application.hourly_rate,
        location: application.location,
        phone: application.phone,
        provider_type: 'individual',
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      return json({
        error: 'Error creando perfil de proveedor',
        details: profileError.message
      }, { status: 500 });
    }

    // Asignar categorías
    if (application.categories && application.categories.length > 0) {
      const categoryAssignments = application.categories.map((cat: any) => ({
        provider_profile_id: profileData.id,
        category_id: cat.category_id
      }));

      const { error: categoryError } = await locals.supabaseAdmin
        .from('provider_categories')
        .insert(categoryAssignments);

      if (categoryError) {
        console.error('Error assigning categories:', categoryError);
      }
    }

    return json({
      success: true,
      message: 'Usuario creado exitosamente para Patricia',
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        tempPassword: tempPassword
      },
      profile: {
        id: profileData.id,
        business_name: profileData.business_name
      },
      categories: application.categories?.length || 0,
      loginUrl: `${process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5173'}/auth/login`
    });

  } catch (error) {
    return json({
      error: 'Error inesperado',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 