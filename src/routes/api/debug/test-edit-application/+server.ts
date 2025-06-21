import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
  try {
    // Datos de prueba para actualizar la aplicación de Patricia
    const updateData = {
      headline: 'Servicio de Limpieza Premium - Patricia',
      bio: 'Especialista en limpieza profunda y mantenimiento. Más de 20 años de experiencia ofreciendo servicios de calidad premium con certificaciones internacionales.',
      hourly_rate: 175, // Aumentado de 150 a 175
      location: 'Managua Centro, Nicaragua',
      phone: '8689-1823',
      experience_years: 22, // Aumentado de 21 a 22
      categories: [2, 1] // Limpieza y otra categoría
    };

    console.log('🔧 Probando edición de aplicación...');
    console.log('📝 Datos a actualizar:', updateData);

    // Buscar la aplicación de Patricia
    const { data: existingApp, error: findError } = await locals.supabaseAdmin
      .from('provider_applications')
      .select('*')
      .eq('email', 'patriciavanegas@gmail.com')
      .maybeSingle();

    if (findError) {
      console.error('Error buscando aplicación:', findError);
      return json({
        error: 'Error buscando aplicación',
        details: findError.message
      }, { status: 500 });
    }

    if (!existingApp) {
      return json({
        error: 'No se encontró la aplicación de Patricia',
        suggestion: 'Ejecuta primero /api/debug/create-patricia-user'
      }, { status: 404 });
    }

    console.log('✅ Aplicación encontrada:', existingApp.id);

    // Actualizar la aplicación
    const { data: updatedApp, error: updateError } = await locals.supabaseAdmin
      .from('provider_applications')
      .update({
        headline: updateData.headline,
        bio: updateData.bio,
        hourly_rate: updateData.hourly_rate,
        location: updateData.location,
        phone: updateData.phone,
        experience_years: updateData.experience_years
      })
      .eq('id', existingApp.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error actualizando aplicación:', updateError);
      return json({
        error: 'Error actualizando aplicación',
        details: updateError.message
      }, { status: 500 });
    }

    console.log('✅ Aplicación actualizada exitosamente');

    // Actualizar categorías
    try {
      // Eliminar categorías existentes
      await locals.supabaseAdmin
        .from('provider_application_categories')
        .delete()
        .eq('application_id', existingApp.id);

      // Insertar nuevas categorías
      if (updateData.categories.length > 0) {
        const categoryInserts = updateData.categories.map(categoryId => ({
          application_id: existingApp.id,
          category_id: categoryId
        }));

        const { error: categoryError } = await locals.supabaseAdmin
          .from('provider_application_categories')
          .insert(categoryInserts);

        if (categoryError) {
          console.error('Error actualizando categorías:', categoryError);
        } else {
          console.log('✅ Categorías actualizadas');
        }
      }
    } catch (categoryError) {
      console.error('Error en proceso de categorías:', categoryError);
    }

    // Obtener la aplicación actualizada con categorías
    const { data: finalApp, error: finalError } = await locals.supabaseAdmin
      .from('provider_applications')
      .select(`
        *,
        categories:provider_application_categories(
          category_id,
          category:categories(name, slug)
        )
      `)
      .eq('id', existingApp.id)
      .single();

    if (finalError) {
      console.error('Error obteniendo aplicación final:', finalError);
    }

    return json({
      success: true,
      message: 'Aplicación editada exitosamente',
      before: {
        headline: existingApp.headline,
        bio: existingApp.bio,
        hourly_rate: existingApp.hourly_rate,
        location: existingApp.location,
        phone: existingApp.phone,
        experience_years: existingApp.experience_years
      },
      after: updatedApp,
      finalData: finalApp,
      changes: {
        headline: `"${existingApp.headline}" → "${updatedApp.headline}"`,
        bio: `"${existingApp.bio?.substring(0, 50)}..." → "${updatedApp.bio?.substring(0, 50)}..."`,
        hourly_rate: `$${existingApp.hourly_rate} → $${updatedApp.hourly_rate}`,
        location: `"${existingApp.location}" → "${updatedApp.location}"`,
        phone: `"${existingApp.phone}" → "${updatedApp.phone}"`,
        experience_years: `${existingApp.experience_years} → ${updatedApp.experience_years} años`
      }
    });

  } catch (error) {
    console.error('💥 Error general:', error);
    return json({
      error: 'Error inesperado',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}; 