import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const POST: RequestHandler = async ({ locals }) => {
  try {
    console.log('🔧 Intentando reparar la aplicación de Domus sa...');
    
    // Buscar la aplicación de "Domus sa"
    const { data: application, error: appError } = await locals.supabaseAdmin
      .from('provider_applications')
      .select(`
        *,
        categories:provider_application_categories(category_id)
      `)
      .eq('email', 'matthewreyesvanegasma@hotmail.com')
      .eq('status', 'approved')
      .maybeSingle();

    if (appError || !application) {
      return json({
        error: 'No se encontró la aplicación de Domus sa o no está aprobada',
        details: appError?.message
      }, { status: 404 });
    }

    console.log('✅ Aplicación encontrada:', application.id);

    // Verificar si ya existe un perfil de proveedor
    let existingProfile = null;
    if (application.user_id) {
      const { data: profile } = await locals.supabaseAdmin
        .from('provider_profiles')
        .select('*')
        .eq('user_id', application.user_id)
        .maybeSingle();
      existingProfile = profile;
    }

    if (existingProfile) {
      return json({
        message: 'La aplicación ya tiene un perfil de proveedor creado',
        profile: existingProfile
      });
    }

    let targetUserId = application.user_id;

    // Si no hay user_id, crear usuario automáticamente
    if (!application.user_id && application.email) {
      const tempPassword = generateTemporaryPassword();
      
      console.log('👤 Creando usuario para:', application.email);
      
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
          first_name: application.headline.split(' ')[0] || 'Usuario',
          last_name: application.headline.split(' ').slice(1).join(' ') || 'Proveedor',
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

      targetUserId = newUser.user.id;
      
      console.log('✅ Usuario creado:', targetUserId);
      
      // Actualizar la aplicación con el nuevo user_id
      await locals.supabaseAdmin
        .from('provider_applications')
        .update({ user_id: targetUserId })
        .eq('id', application.id);

      console.log('📧 Credenciales temporales - Email:', application.email, 'Password:', tempPassword);
    }

    // Crear perfil de proveedor
    if (targetUserId) {
      console.log('👔 Creando perfil de proveedor...');
      
      const { data: profileData, error: profileError } = await locals.supabaseAdmin
        .from('provider_profiles')
        .insert({
          user_id: targetUserId,
          business_name: application.headline,
          headline: application.headline,
          bio: application.bio,
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

      console.log('✅ Perfil creado:', profileData.id);

      // Asignar categorías
      if (application.categories && application.categories.length > 0) {
        console.log('🏷️ Asignando categorías...');
        
        const categoryAssignments = application.categories.map((cat: any) => ({
          provider_profile_id: profileData.id,
          category_id: cat.category_id
        }));

        const { error: categoryError } = await locals.supabaseAdmin
          .from('provider_categories')
          .insert(categoryAssignments);

        if (categoryError) {
          console.error('Error asignando categorías:', categoryError);
        } else {
          console.log('✅ Categorías asignadas:', categoryAssignments.length);
        }
      }

      return json({
        success: true,
        message: 'Perfil de proveedor creado exitosamente para Domus sa',
        user_id: targetUserId,
        profile_id: profileData.id,
        business_name: profileData.business_name,
        categories_assigned: application.categories?.length || 0
      });
    }

    return json({
      error: 'No se pudo obtener user_id válido'
    }, { status: 500 });

  } catch (error) {
    console.error('Error en fix-domus-application:', error);
    return json({
      error: 'Error inesperado',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 