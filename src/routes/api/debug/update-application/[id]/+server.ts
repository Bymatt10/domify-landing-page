import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/debug/update-application/{id}:
 *   put:
 *     summary: Update a provider application
 *     description: Updates a provider application status and creates provider profile if approved
 *     tags: [Debug]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *                 enum: [submitted, in_review, approved, rejected]
 *               reviewed_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Application updated successfully
 *       500:
 *         description: Error updating application
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const applicationId = params.id;
    const updateData = await request.json();

    if (!applicationId) {
      return json({
        error: {
          message: 'Application ID is required'
        }
      }, { status: 400 });
    }

    // Use admin client to avoid RLS issues
    const { data, error } = await locals.supabaseAdmin
      .from('provider_applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      return json({
        error: {
          message: 'Error updating application',
          details: error.message,
          code: error.code
        }
      }, { status: 500 });
    }

    return json({
      success: true,
      application: data,
      message: 'Application updated successfully'
    });

  } catch (error) {
    return json({
      error: {
        message: 'Failed to update application',
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
}; 