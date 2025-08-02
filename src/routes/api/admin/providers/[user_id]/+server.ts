import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '$lib/env-utils';

// Get environment variables with fallbacks
const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

// GET - Obtener detalles de un proveedor específico
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { user_id } = params;

    if (!user_id) {
      return json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // Obtener datos del proveedor con información del usuario
    const providerResponse = await fetch(`${SUPABASE_URL}/rest/v1/provider_profiles?user_id=eq.${user_id}&select=*,user:auth.users(email,phone)`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!providerResponse.ok) {
      const error = await providerResponse.text();
      console.error('Error fetching provider:', error);
      return json({ error: 'Error al obtener datos del proveedor' }, { status: 500 });
    }

    const providers = await providerResponse.json();
    
    if (providers.length === 0) {
      return json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    return json({ provider: providers[0] });

  } catch (error) {
    console.error('Error in GET provider details:', error);
    return json({ error: 'Error interno del servidor' }, { status: 500 });
  }
};

// PUT - Actualizar información del proveedor
export const PUT: RequestHandler = async ({ request, params }) => {
  try {
    const { user_id } = params;
    const updateData = await request.json();

    if (!user_id) {
      return json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // Validar los datos de entrada
    const allowedFields = ['business_name', 'headline', 'bio', 'hourly_rate', 'location', 'phone'];
    const filteredData: any = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // Agregar timestamp de actualización
    filteredData.updated_at = new Date().toISOString();

    // Si se proporciona un email, actualizar también en auth.users
    if (updateData.email && updateData.email.trim() !== '') {
      const emailUpdateResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user_id}`, {
        method: 'PUT',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: updateData.email.trim()
        })
      });

      if (!emailUpdateResponse.ok) {
        const error = await emailUpdateResponse.text();
        console.error('Error updating user email:', error);
        return json({ error: 'Error al actualizar el email del usuario' }, { status: 500 });
      }
    }

    // Actualizar el perfil del proveedor
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/provider_profiles?user_id=eq.${user_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(filteredData)
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error('Error updating provider:', error);
      return json({ error: 'Error al actualizar el proveedor' }, { status: 500 });
    }

    const updatedProviders = await updateResponse.json();
    
    if (updatedProviders.length === 0) {
      return json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    const updatedProvider = updatedProviders[0];

    // Manejar actualización de categorías si se proporcionaron
    if (updateData.category_ids && Array.isArray(updateData.category_ids)) {
      // console.log removed
      // console.log removed
      
      try {
        // Primero, eliminar todas las categorías existentes del proveedor
        // console.log removed
        const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/provider_categories?provider_profile_id=eq.${updatedProvider.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!deleteResponse.ok) {
          const deleteError = await deleteResponse.text();
          console.error('❌ Error deleting existing categories:', deleteError);
        } else {
          // console.log removed
        }

        // Luego, insertar las nuevas categorías
        if (updateData.category_ids.length > 0) {
          // console.log removed
          const categoryInserts = updateData.category_ids.map((categoryId: number) => ({
            provider_profile_id: updatedProvider.id,
            category_id: categoryId
          }));

          // console.log removed

          const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/provider_categories`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(categoryInserts)
          });

          if (!insertResponse.ok) {
            const error = await insertResponse.text();
            console.error('❌ Error inserting new categories:', error);
          } else {
            // console.log removed
          }
        } else {
          // console.log removed
        }
      } catch (categoryError) {
        console.error('❌ Error updating categories:', categoryError);
        // No fallar la actualización principal por errores de categorías
      }
    } else {
      // console.log removed
    }

    // Si se actualizó el email, incluirlo en la respuesta
    const result = updatedProvider;
    if (updateData.email) {
      result.user = { email: updateData.email.trim() };
    }

    return json(result);

  } catch (error) {
    console.error('Error in PUT provider update:', error);
    return json({ error: 'Error interno del servidor' }, { status: 500 });
  }
};

// PATCH - Activar/Desactivar proveedor
export const PATCH: RequestHandler = async ({ request, params }) => {
  try {
    const { user_id } = params;
    const { action } = await request.json();

    if (!user_id) {
      return json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    if (!action || !['activate', 'deactivate'].includes(action)) {
      return json({ error: 'Acción inválida. Use "activate" o "deactivate"' }, { status: 400 });
    }

    const isActive = action === 'activate';

    // Actualizar el estado del proveedor
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/provider_profiles?user_id=eq.${user_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error('Error updating provider status:', error);
      return json({ error: 'Error al actualizar el estado del proveedor' }, { status: 500 });
    }

    const updatedProviders = await updateResponse.json();
    
    if (updatedProviders.length === 0) {
      return json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    const message = isActive 
      ? 'Proveedor activado exitosamente' 
      : 'Proveedor desactivado exitosamente';

    return json({
      message,
      provider: updatedProviders[0]
    });

  } catch (error) {
    console.error('Error in PATCH provider status:', error);
    return json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}; 