import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/supabase-admin';
import { sendProviderWelcomeEmail } from '$lib/email-service';

// Función para generar contraseña temporal
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Función para procesar la aprobación automática de una aplicación
async function processApplicationApproval(application: any, supabaseAdmin: any) {
  try {
    // console.log removed

    let targetUserId = application.user_id;
    let tempPassword = null;

    // Si no hay user_id, buscar usuario existente o crear uno nuevo
    if (!application.user_id && application.email) {
      // console.log removed
      
      // Primero intentar encontrar usuario existente
      const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
      
      let existingUser = null;
      if (!searchError && existingUsers?.users) {
        existingUser = existingUsers.users.find((u: any) => u.email === application.email);
      }
      
      if (existingUser) {
        // console.log removed
        targetUserId = existingUser.id;
        
        // Actualizar la aplicación con el user_id existente
        await supabaseAdmin
          .from('provider_applications')
          .update({ user_id: targetUserId })
          .eq('id', application.id);
          
      } else {
        // Crear nuevo usuario
        tempPassword = generateTemporaryPassword();
        
        // console.log removed
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
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
          console.error('❌ Error creando usuario:', createError);
          return;
        }

        if (newUser.user) {
          targetUserId = newUser.user.id;
          
          // Actualizar la aplicación con el nuevo user_id
          await supabaseAdmin
            .from('provider_applications')
            .update({ user_id: targetUserId })
            .eq('id', application.id);

          // console.log removed
        }
      }
    }

    if (!targetUserId) {
      console.error('❌ No se pudo obtener user_id válido');
      return;
    }

    // Crear perfil de customer primero
    // console.log removed
    
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        user_id: targetUserId,
        first_name: application.headline.split(' ')[0] || 'Usuario',
        last_name: application.headline.split(' ').slice(1).join(' ') || 'Proveedor',
        phone_number: application.phone,
        role: 'provider'
      })
      .select()
      .single();

    if (customerError) {
      console.error('❌ Error creando customer:', customerError);
    } else {
      // console.log removed
    }

    // console.log removed

    // Crear el perfil de proveedor
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('provider_profiles')
      .insert({
        user_id: targetUserId,
        business_name: application.headline,
        headline: application.headline,
        bio: application.bio,
        hourly_rate: application.hourly_rate,
        location: application.location,
        phone: application.phone,
        provider_type: application.application_data?.provider_type || 'individual',
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      return;
    }

    // console.log removed

    // Obtener y asignar categorías
    const { data: categoryData } = await supabaseAdmin
      .from('provider_application_categories')
      .select('category_id')
      .eq('application_id', application.id);

    if (categoryData && categoryData.length > 0) {
      // console.log removed
      
      const categoryAssignments = categoryData.map((item: any) => ({
        provider_profile_id: profileData.id,
        category_id: item.category_id
      }));

      const { error: categoryError } = await supabaseAdmin
        .from('provider_categories')
        .insert(categoryAssignments);

      if (categoryError) {
        console.error('❌ Error asignando categorías:', categoryError);
      } else {
        // console.log removed
      }
    }

    // Enviar email de bienvenida si se creó un nuevo usuario
    if (tempPassword) {
      try {
        await sendProviderWelcomeEmail(
          application.email,
          application.headline.split(' ')[0] || 'Usuario',
          tempPassword,
          'https://domify.com/auth/login' // URL de login
        );
        // console.log removed
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError);
      }
    }

    // console.log removed
  } catch (error) {
    console.error('❌ Error en processApplicationApproval:', error);
  }
}

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const { id } = params;
    
    // Verificar autenticación
    const { session, user } = await locals.safeGetSession();
    if (!session || !user) {
      return json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si es administrador
    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      return json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Obtener la aplicación por ID
    const { data: application, error } = await supabaseAdmin
      .from('provider_applications')
      .select(`
        *
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return json({ error: 'Aplicación no encontrada' }, { status: 404 });
      }
      throw new Error(error.message);
    }

    // Obtener categorías por separado
    const { data: categoriesData, error: categoriesError } = await supabaseAdmin
      .from('provider_application_categories')
      .select(`
        category_id,
        categories(id, name, slug)
      `)
      .eq('application_id', id);

    // Formatear categorías
    const categories = (categoriesData || []).map((cat: any) => ({
      category_id: cat.category_id,
      id: cat.categories?.id || cat.category_id,
      name: cat.categories?.name || `Categoría ${cat.category_id}`,
      slug: cat.categories?.slug
    }));

    // Agregar categorías a la aplicación
    const applicationWithCategories = {
      ...application,
      categories: categories
    };

    return json({ 
      data: applicationWithCategories, 
      message: 'Application retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /api/provider-applications/[id]:', error);
    return json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    
    // Verificar autenticación
    const { session, user } = await locals.safeGetSession();
    if (!session || !user) {
      return json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si es administrador
    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      return json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const updateData = await request.json();
    
    // Obtener los datos actuales de la aplicación para hacer actualización incremental
    const { data: currentApplication, error: getCurrentError } = await supabaseAdmin
      .from('provider_applications')
      .select('application_data')
      .eq('id', id)
      .single();
    
    if (getCurrentError) {
      if (getCurrentError.code === 'PGRST116') {
        return json({ error: 'Aplicación no encontrada' }, { status: 404 });
      }
      throw new Error(getCurrentError.message);
    }
    
    // Campos permitidos para actualización directa en la tabla
    const allowed = [
      'status', 'rejection_reason', 'reviewed_at', 'reviewed_by_admin_id',
      'headline', 'bio', 'hourly_rate', 'location', 'phone', 'email'
    ];
    
    const updateFields: any = {};
    for (const key of allowed) {
      if (key in updateData) updateFields[key] = updateData[key];
    }

    // Manejar application_data - estos campos van en el JSON application_data
    const applicationDataFields = [
      'first_name', 'last_name', 'address', 'department', 'city', 
      'experience_years', 'availability', 'certifications'
    ];
    
    let hasApplicationData = false;
    // Comenzar con los datos actuales de application_data
    const applicationData: any = currentApplication.application_data || {};
    
    // Si se proporciona application_data directamente, combinarlo con los datos actuales
    if (updateData.application_data) {
      Object.assign(applicationData, updateData.application_data);
      hasApplicationData = true;
    }
    
    // Agregar campos individuales que van en application_data
    for (const field of applicationDataFields) {
      if (updateData[field] !== undefined) {
        applicationData[field] = updateData[field];
        hasApplicationData = true;
      }
    }
    
    // Solo actualizar application_data si hay datos para actualizar
    if (hasApplicationData) {
      updateFields.application_data = applicationData;
    }

    // Agregar campos de auditoría
    if (updateData.status) {
      updateFields.reviewed_at = new Date().toISOString();
      updateFields.reviewed_by_admin_id = user.id;
    }

    // Actualizar la aplicación
    const { data, error } = await supabaseAdmin
      .from('provider_applications')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return json({ error: 'Aplicación no encontrada' }, { status: 404 });
      }
      throw new Error(error.message);
    }

    // Si el estado cambió a "approved", ejecutar el proceso de aprobación automática
    if (updateData.status === 'approved' && data) {
      await processApplicationApproval(data, supabaseAdmin);
    }

    // Actualizar categorías si se proporcionaron
    if (updateData.categories && Array.isArray(updateData.categories)) {
      try {
        // Eliminar categorías existentes
        await supabaseAdmin
          .from('provider_application_categories')
          .delete()
          .eq('application_id', id);

        // Insertar nuevas categorías
        if (updateData.categories.length > 0) {
          const categoryInserts = updateData.categories.map((categoryId: number) => ({
            application_id: parseInt(id),
            category_id: categoryId
          }));

          await supabaseAdmin
            .from('provider_application_categories')
            .insert(categoryInserts);
        }
      } catch (categoryError) {
        console.error('Error updating categories:', categoryError);
        // No fallar la actualización principal por errores de categorías
      }
    }

    return json({ 
      data, 
      message: 'Application updated successfully' 
    });
  } catch (error) {
    console.error('Error in PUT /api/provider-applications/[id]:', error);
    return json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const { id } = params;
    
    // Verificar autenticación
    const { session, user } = await locals.safeGetSession();
    if (!session || !user) {
      return json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si es administrador
    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      return json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Soft delete: cambiar status a rejected
    const { data, error } = await supabaseAdmin
      .from('provider_applications')
      .update({ 
        status: 'rejected', 
        rejection_reason: 'Eliminado por administrador',
        reviewed_at: new Date().toISOString(),
        reviewed_by_admin_id: user.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return json({ error: 'Aplicación no encontrada' }, { status: 404 });
      }
      throw new Error(error.message);
    }

    return json({ 
      data, 
      message: 'Application deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /api/provider-applications/[id]:', error);
    return json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}; 