import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { sendEmail, type WelcomeEmailData } from '$lib/email.js';
import { createClient } from '@supabase/supabase-js';

import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';
// Cliente directo para admin operations
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Función helper para hacer queries directas con fetch
async function directSupabaseQuery(endpoint: string, options: any = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase query failed:', response.status, response.statusText, errorText);
    throw new Error(`Supabase query failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Función para generar contraseña temporal
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Función para enviar email de bienvenida
async function sendWelcomeEmail(email: string, tempPassword: string, providerName: string): Promise<void> {
  try {
    const loginUrl = `${process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5173'}/auth/login`;
    
    // Importar el servicio de email
    const { sendEmail, createProviderWelcomeEmail } = await import('$lib/email-service');

// Get environment variables with fallbacks
const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();
const SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

    
    // Crear el HTML del email usando la plantilla
    const emailHtml = createProviderWelcomeEmail({
      name: providerName,
      email: email,
      tempPassword: tempPassword,
      loginUrl: loginUrl
    });

    const result = await sendEmail({
      to: email,
      subject: '¡Bienvenido a Domify! - Tu cuenta ha sido aprobada',
      html: emailHtml
    });

    if (result) {
      console.log('✅ Email de bienvenida enviado exitosamente a:', email);
    } else {
      console.error('❌ Error enviando email de bienvenida');
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // No fallar la aprobación si el email falla
  }
}

/**
 * @swagger
 * /api/provider_applications:
 *   get:
 *     summary: List or get provider applications
 *     description: Retrieve all provider applications or a single one by id
 *     tags: [ProviderApplications]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: Application ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user_id
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, in_review, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in headline
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *         description: Filter by date range
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Applications retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProviderApplication'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error
 */
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const id = url.searchParams.get('id');
    const user_id = url.searchParams.get('user_id');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const date = url.searchParams.get('date');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Construir query con filtros
    console.log('Fetching provider applications with filters:', { status, search, category, date });
    
    let queryParams = [`limit=${limit}`, `offset=${offset}`, 'order=created_at.desc'];
    
    // Aplicar filtro de estado
    if (status && status !== 'all') {
      queryParams.push(`status=eq.${status}`);
    }
    
    // Aplicar filtro de búsqueda en múltiples campos
    if (search && search.trim()) {
      const searchTerm = search.trim();
      // Buscar en headline, bio, email, phone, location usando OR
      queryParams.push(`or=(headline.ilike.*${searchTerm}*,bio.ilike.*${searchTerm}*,email.ilike.*${searchTerm}*,phone.ilike.*${searchTerm}*,location.ilike.*${searchTerm}*)`);
    }
    
    // Aplicar filtro de fecha
    if (date && date !== 'all') {
      const now = new Date();
      let dateFilter = '';
      
      switch (date) {
        case 'today':
          const today = now.toISOString().split('T')[0];
          dateFilter = `created_at=gte.${today}T00:00:00.000Z&created_at=lt.${today}T23:59:59.999Z`;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = `created_at=gte.${weekAgo.toISOString()}`;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = `created_at=gte.${monthAgo.toISOString()}`;
          break;
      }
      
      if (dateFilter) {
        queryParams.push(dateFilter);
      }
    }
    
    const queryString = queryParams.join('&');
    let applications = await directSupabaseQuery(`provider_applications?${queryString}`);
    
    // Aplicar filtro de categoría después de obtener las aplicaciones (requiere join)
    if (category && category !== 'all') {
      const categoryId = parseInt(category);
      if (!isNaN(categoryId)) {
        // Obtener IDs de aplicaciones que tienen esta categoría
        const appIdsWithCategory = await directSupabaseQuery(
          `provider_application_categories?category_id=eq.${categoryId}&select=application_id`
        );
        const validAppIds = appIdsWithCategory.map((item: any) => item.application_id);
        
        // Filtrar aplicaciones por IDs válidos
        applications = applications.filter((app: any) => validAppIds.includes(app.id));
      }
    }

    // Aplicar filtro de búsqueda adicional en application_data si no se encontraron resultados suficientes
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      applications = applications.filter((app: any) => {
        // Buscar en campos básicos (ya cubierto por la query)
        const basicMatch = 
          app.headline?.toLowerCase().includes(searchTerm) ||
          app.bio?.toLowerCase().includes(searchTerm) ||
          app.email?.toLowerCase().includes(searchTerm) ||
          app.phone?.toLowerCase().includes(searchTerm) ||
          app.location?.toLowerCase().includes(searchTerm);

        // Buscar en application_data
        const dataMatch = app.application_data && (
          app.application_data.first_name?.toLowerCase().includes(searchTerm) ||
          app.application_data.last_name?.toLowerCase().includes(searchTerm) ||
          app.application_data.email?.toLowerCase().includes(searchTerm) ||
          app.application_data.address?.toLowerCase().includes(searchTerm) ||
          app.application_data.department?.toLowerCase().includes(searchTerm) ||
          app.application_data.city?.toLowerCase().includes(searchTerm)
        );
        
        return basicMatch || dataMatch;
      });
    }
    
    console.log('Applications fetched successfully:', applications.length, 'with filters:', { status, search, category, date });

    // Obtener categorías para cada aplicación
    const formattedApplications = await Promise.all((applications || []).map(async (app: any) => {
      let categories = [];
      
      try {
        // Obtener categorías de la aplicación
        const categoriesData = await directSupabaseQuery(
          `provider_application_categories?application_id=eq.${app.id}&select=category_id,categories(id,name)`
        );
        
        categories = categoriesData.map((cat: any) => ({
          category_id: cat.category_id,
          id: cat.categories?.id || cat.category_id,
          name: cat.categories?.name || `Categoría ${cat.category_id}`
        }));
      } catch (error) {
        console.error(`Error fetching categories for application ${app.id}:`, error);
        categories = [];
      }

      return {
        ...app,
        user: {
          id: app.user_id || null,
          email: app.email || 'Email no disponible',
          raw_user_meta_data: {}
        },
        categories: categories
      };
    }));

    // Para el total, necesitamos hacer una query separada sin limit/offset
    let totalQueryParams = queryParams.filter(param => !param.startsWith('limit=') && !param.startsWith('offset='));
    const totalQueryString = totalQueryParams.join('&');
    let totalApplications = await directSupabaseQuery(`provider_applications?${totalQueryString}&select=id,application_data,headline,bio,email,phone,location`);
    
    // Aplicar filtro de categoría también para el total
    if (category && category !== 'all') {
      const categoryId = parseInt(category);
      if (!isNaN(categoryId)) {
        const appIdsWithCategory = await directSupabaseQuery(
          `provider_application_categories?category_id=eq.${categoryId}&select=application_id`
        );
        const validAppIds = appIdsWithCategory.map((item: any) => item.application_id);
        totalApplications = totalApplications.filter((app: any) => validAppIds.includes(app.id));
      }
    }

    // Aplicar filtro de búsqueda adicional para el total
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      totalApplications = totalApplications.filter((app: any) => {
        // Buscar en campos básicos
        const basicMatch = 
          app.headline?.toLowerCase().includes(searchTerm) ||
          app.bio?.toLowerCase().includes(searchTerm) ||
          app.email?.toLowerCase().includes(searchTerm) ||
          app.phone?.toLowerCase().includes(searchTerm) ||
          app.location?.toLowerCase().includes(searchTerm);
        
        // Buscar en application_data
        const dataMatch = app.application_data && (
          app.application_data.first_name?.toLowerCase().includes(searchTerm) ||
          app.application_data.last_name?.toLowerCase().includes(searchTerm) ||
          app.application_data.email?.toLowerCase().includes(searchTerm) ||
          app.application_data.address?.toLowerCase().includes(searchTerm) ||
          app.application_data.department?.toLowerCase().includes(searchTerm) ||
          app.application_data.city?.toLowerCase().includes(searchTerm)
        );
        
        return basicMatch || dataMatch;
      });
    }
    
    const total = totalApplications.length;
    const totalPages = Math.ceil(total / limit);

    return json({ 
      applications: formattedApplications, 
      total,
      page,
      limit,
      totalPages,
      message: 'Applications retrieved', 
      statusCode: 200, 
      timestamp: new Date().toISOString() 
    });

  } catch (error) {
    console.error('Error in GET /api/provider-applications:', error);
    return json({ 
      error: { message: error instanceof Error ? error.message : 'Error desconocido' } 
    }, { status: 500 });
  }
};

/**
 * @swagger
 * /api/provider_applications:
 *   post:
 *     summary: Create a provider application
 *     description: Submit a new provider application
 *     tags: [ProviderApplications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, status, application_data]
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [submitted, approved, rejected]
 *               application_data:
 *                 type: object
 *               rejection_reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ProviderApplication'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Verificar autenticación usando getUser()
    const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
    if (!user || authError) {
      return json({ error: { message: 'No autorizado', statusCode: 401, timestamp: new Date().toISOString() } }, { status: 401 });
    }

    const appData = await request.json();
    
    // Validar campos requeridos
    if (!appData.headline) throw new Error('headline is required');
    if (!appData.bio) throw new Error('bio is required');
    if (!appData.hourly_rate) throw new Error('hourly_rate is required');
    if (!appData.location) throw new Error('location is required');
    if (!appData.phone) throw new Error('phone is required');
    if (!appData.categories || appData.categories.length === 0) throw new Error('categories are required');

    // Verificar si el usuario ya tiene una aplicación pendiente o aprobada
    const { data: existingApp, error: checkError } = await locals.supabase
      .from('provider_applications')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['submitted', 'in_review', 'approved'])
      .maybeSingle();

    if (checkError) {
      throw new Error('Error checking existing applications');
    }

    if (existingApp) {
      throw new Error('Ya tienes una aplicación en proceso. No puedes enviar otra aplicación.');
    }

    // Crear la aplicación
    const { data, error } = await locals.supabase
      .from('provider_applications')
      .insert({
        user_id: user.id,
        status: 'submitted',
        application_data: appData, // Guardar todos los datos de la app en el campo jsonb
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return json({ 
      data, 
      message: 'Application created successfully', 
      statusCode: 201, 
      timestamp: new Date().toISOString() 
    }, { status: 201 });
  } catch (error) {
    return json({ 
      error: { 
        message: error instanceof Error ? error.message : 'Unknown error', 
        statusCode: 400, 
        timestamp: new Date().toISOString() 
      } 
    }, { status: 400 });
  }
};

/**
 * @swagger
 * /api/provider_applications:
 *   put:
 *     summary: Update a provider application
 *     description: Update status, rejection_reason, or review fields
 *     tags: [ProviderApplications]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [submitted, approved, rejected]
 *               rejection_reason:
 *                 type: string
 *               reviewed_at:
 *                 type: string
 *                 format: date-time
 *               reviewed_by_admin_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Application updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ProviderApplication'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error
 */
export const PUT: RequestHandler = async ({ request, url, locals }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) throw new Error('Application id is required');
    const updateData = await request.json();
    // Permitir más campos para edición por admin
    const allowed = [
      'status', 'rejection_reason', 'reviewed_at', 'reviewed_by_admin_id',
      'headline', 'bio', 'hourly_rate', 'location', 'phone', 'experience_years'
    ];
    const updateFields: any = {};
    for (const key of allowed) {
      if (key in updateData) updateFields[key] = updateData[key];
    }

    // Manejar categorías por separado si se incluyen
    const categoriesUpdate = updateData.categories;

    // Obtener la aplicación actual para verificar si se está aprobando
    const currentAppData = await directSupabaseQuery(`provider_applications?id=eq.${id}`);
    if (!currentAppData || currentAppData.length === 0) throw new Error('Application not found');
    const currentApp = currentAppData[0];

    // Actualizar la aplicación usando fetch directo
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/provider_applications?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateFields)
    });

    if (!updateResponse.ok) {
      throw new Error('Application not found or update failed');
    }

    const data = await updateResponse.json();
    if (!data || data.length === 0) throw new Error('Application not found or update failed');

    // Actualizar categorías si se proporcionaron
    if (categoriesUpdate && Array.isArray(categoriesUpdate)) {
      try {
        // Eliminar categorías existentes
        await supabaseAdmin
          .from('provider_application_categories')
          .delete()
          .eq('application_id', id);

        // Insertar nuevas categorías
        if (categoriesUpdate.length > 0) {
          const categoryInserts = categoriesUpdate.map(categoryId => ({
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

    // Si la aplicación se está aprobando, crear el perfil del proveedor
    if (updateData.status === 'approved' && currentApp.status !== 'approved') {
      try {
        let targetUserId = currentApp.user_id;

        // Si no hay user_id, crear usuario automáticamente
        if (!currentApp.user_id && currentApp.email) {
          const tempPassword = generateTemporaryPassword();
          
          try {
            // Crear usuario en Supabase Auth
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
              email: currentApp.email,
              password: tempPassword,
              email_confirm: true,
              user_metadata: {
                role: 'provider', // Rol principal será provider
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
              console.error('Error creating user:', createError);
              throw new Error(`Error creating user: ${createError.message}`);
            }

            if (newUser.user) {
              targetUserId = newUser.user.id;
              
              // Actualizar la aplicación con el nuevo user_id
              await supabaseAdmin
                .from('provider_applications')
                .update({ user_id: targetUserId })
                .eq('id', currentApp.id);

              // Crear perfiles tanto de customer como de provider
              await Promise.all([
                // Perfil de customer
                supabaseAdmin
                  .from('customers')
                  .insert({
                    user_id: targetUserId,
                    first_name: currentApp.headline.split(' ')[0] || 'Usuario',
                    last_name: currentApp.headline.split(' ').slice(1).join(' ') || 'Proveedor',
                    phone_number: currentApp.phone,
                    role: 'customer'
                  }),
              ]);

              // Enviar email con credenciales
              await sendWelcomeEmail(currentApp.email, tempPassword, currentApp.headline);
            }
          } catch (userCreationError) {
            console.error('Error in user creation process:', userCreationError);
            throw new Error(`Failed to create user: ${userCreationError instanceof Error ? userCreationError.message : String(userCreationError)}`);
          }
        }

        // Crear perfil del proveedor (para usuarios existentes o recién creados)
        if (targetUserId) {
          // Crear perfil del proveedor
          const { data: profileData, error: profileError } = await supabaseAdmin
            .from('provider_profiles')
            .insert({
              user_id: targetUserId,
              business_name: currentApp.headline, // Usar headline como business_name
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
            console.error('Error creating provider profile:', profileError);
            // No fallar la actualización si no se puede crear el perfil
          } else if (profileData) {
            // Asignar categorías al proveedor usando provider_profile_id
            const { data: categoryData, error: categoryError } = await supabaseAdmin
              .from('provider_application_categories')
              .select('category_id')
              .eq('application_id', currentApp.id);

            if (categoryData && categoryData.length > 0) {
              const categoryAssignments = categoryData.map((item: any) => ({
                provider_profile_id: profileData.id, // Usar el ID del perfil creado
                category_id: item.category_id
              }));

              const { error: assignError } = await supabaseAdmin
                .from('provider_categories')
                .insert(categoryAssignments);

              if (assignError) {
                console.error('Error assigning categories:', assignError);
              }
            }

            // Actualizar el rol del usuario a 'provider' (solo si hay user_id)
            try {
              const { error: userError } = await supabaseAdmin.auth.admin.updateUserById(
                targetUserId,
                { user_metadata: { role: 'provider' } }
              );

              if (userError) {
                console.error('Error updating user role:', userError);
              }
            } catch (authError) {
              console.error('Error updating user role:', authError);
            }
          }
        } else {
          console.log('Application has no user_id and no email, cannot create user or profile');
        }
      } catch (profileCreationError) {
        console.error('Error in profile creation process:', profileCreationError);
        // No fallar la actualización principal
      }
    }

    return json({ data, message: 'Application updated', statusCode: 200, timestamp: new Date().toISOString() });
  } catch (error) {
    return json({ error: { message: error instanceof Error ? error.message : 'Unknown error', statusCode: 400, timestamp: new Date().toISOString() } }, { status: 400 });
  }
};

/**
 * @swagger
 * /api/provider_applications:
 *   delete:
 *     summary: Delete (soft) a provider application
 *     description: Soft delete by setting rejection_reason and status to rejected
 *     tags: [ProviderApplications]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application soft deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ProviderApplication'
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error
 */
export const DELETE: RequestHandler = async ({ url, locals }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) throw new Error('Application id is required');
    // Soft delete: set status to rejected and add a generic rejection_reason
    const { data, error } = await locals.supabase
      .from('provider_applications')
      .update({ status: 'rejected', rejection_reason: 'Deleted by user', reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new Error('Application not found or delete failed');
    return json({ data, message: 'Application soft deleted', statusCode: 200, timestamp: new Date().toISOString() });
  } catch (error) {
    return json({ error: { message: error instanceof Error ? error.message : 'Unknown error', statusCode: 400, timestamp: new Date().toISOString() } }, { status: 400 });
  }
}; 