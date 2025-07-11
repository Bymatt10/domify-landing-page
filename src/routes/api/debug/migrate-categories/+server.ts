import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler, AuthenticationException } from '$lib/exceptions';

/*
 * POST /api/debug/migrate-categories
 * Reasigna los providers que usaban las categorías antiguas (ensamblaje, montaje, etc.)
 * a sus nuevas contrapartes y elimina las categorías viejas.
 * SOLO PARA ENTORNOS DE DESARROLLO.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // Auth simple usando demo-token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ') || !authHeader.includes('demo-token')) {
            throw new AuthenticationException('Solo disponible con demo-token');
        }

        // Mapeo viejo->nuevo slug
        const mapping: Record<string, string> = {
            ensamblaje: 'carpinteria',
            montaje: 'albanileria',
            mudanzas: 'mecanica-automotriz', // aproximación
            limpieza: 'limpieza-casas',
            jardineria: 'jardineria'
        };

        const summaries: Array<{ old: string; new: string; migratedRows: number }> = [];

        for (const oldSlug of Object.keys(mapping)) {
            const newSlug = mapping[oldSlug];

            // Obtener IDs de categorías
            const { data: oldCat } = await locals.supabase.from('categories').select('id').eq('slug', oldSlug).single();
            const { data: newCat } = await locals.supabase.from('categories').select('id').eq('slug', newSlug).single();

            if (!oldCat || !newCat) {
                continue; // nada que migrar
            }

            // Reasignar provider_categories
            const { data: updatedRows, error: updateError } = await locals.supabase
                .from('provider_categories')
                .update({ category_id: newCat.id })
                .eq('category_id', oldCat.id)
                .select('*');

            const migratedCount = updatedRows ? updatedRows.length : 0;

            if (updateError) {
                throw updateError;
            }

            summaries.push({ old: oldSlug, new: newSlug, migratedRows: migratedCount });

            // Eliminar categoría vieja
            await locals.supabase.from('categories').delete().eq('id', oldCat.id);
        }

        return json({ status: 'ok', summaries });
    } catch (err) {
        const errorResponse = ExceptionHandler.handle(err);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 