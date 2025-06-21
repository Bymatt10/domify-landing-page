import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params, locals }) => {
    try {
        const { supabaseAdmin } = locals;
        const applicationId = params.id;

        // Primero eliminar las categorías asociadas
        const { error: categoryError } = await supabaseAdmin
            .from('provider_application_categories')
            .delete()
            .eq('application_id', applicationId);

        if (categoryError) {
            return json({
                error: {
                    message: 'Error deleting categories',
                    details: categoryError.message,
                    statusCode: 500
                }
            }, { status: 500 });
        }

        // Luego eliminar la aplicación
        const { error: applicationError } = await supabaseAdmin
            .from('provider_applications')
            .delete()
            .eq('id', applicationId);

        if (applicationError) {
            return json({
                error: {
                    message: 'Error deleting application',
                    details: applicationError.message,
                    statusCode: 500
                }
            }, { status: 500 });
        }

        return json({
            message: 'Application deleted successfully',
            applicationId: applicationId,
            statusCode: 200
        });

    } catch (error) {
        return json({
            error: {
                message: 'Failed to delete application',
                details: error instanceof Error ? error.message : String(error),
                statusCode: 500
            }
        }, { status: 500 });
    }
}; 