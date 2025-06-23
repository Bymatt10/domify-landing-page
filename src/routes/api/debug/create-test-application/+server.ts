import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/debug/create-test-application:
 *   post:
 *     summary: Create a test provider application
 *     description: Creates a test provider application with user_id for testing approval process
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Test application created successfully
 *       500:
 *         description: Error creating test application
 */
export const POST: RequestHandler = async ({ locals }) => {
  try {
    // Create a test application with user_id
    const { data, error } = await locals.supabaseAdmin
      .from('provider_applications')
      .insert({
        user_id: 'dcb0aeba-9640-4683-8487-da9f6be21e3f', // Admin user ID
        headline: 'Test Provider Application',
        bio: 'Testing approval process with user_id',
        hourly_rate: 25.00,
        location: 'Managua',
        phone: '12345678',
        email: 'testwithuser@example.com',
        application_data: {
        experience_years: 3,
        certifications: ['Test Certification'],
          availability: { monday: true, tuesday: true }
        },
        status: 'submitted'
      })
      .select()
      .single();

    if (error) {
      return json({
        error: {
          message: 'Error creating test application',
          details: error.message
        }
      }, { status: 500 });
    }

    // Create category link for the application
    const { error: categoryError } = await locals.supabaseAdmin
      .from('provider_application_categories')
      .insert({
        application_id: data.id,
        category_id: 1
      });

    if (categoryError) {
      console.error('Error creating category link:', categoryError);
    }

    return json({
      success: true,
      application: data,
      message: 'Test application created successfully'
    });

  } catch (error) {
    return json({
      error: {
        message: 'Failed to create test application',
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
}; 