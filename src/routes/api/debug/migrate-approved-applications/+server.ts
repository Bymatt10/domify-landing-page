import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * @swagger
 * /api/debug/migrate-approved-applications:
 *   post:
 *     summary: Migrate approved applications to provider profiles
 *     description: Creates provider profiles for all approved applications that don't have one
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Migration completed successfully
 *       500:
 *         description: Error during migration
 */
export const POST: RequestHandler = async ({ locals }) => {
  try {
    // Get all approved applications
    const { data: applications, error: appError } = await locals.supabase
      .from('provider_applications')
      .select('*')
      .eq('status', 'approved');

    if (appError) {
      return json({ 
        error: 'Error fetching applications', 
        details: appError.message 
      }, { status: 500 });
    }

    let migrated = 0;
    let alreadyExisted = 0;
    let errors: any[] = [];

    for (const app of applications || []) {
      // Check if provider profile already exists
      const { data: existing, error: existError } = await locals.supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', app.user_id)
        .maybeSingle();

      if (existError) {
        errors.push({ user_id: app.user_id, error: existError.message });
        continue;
      }

      let providerProfileId = existing?.id;

      // Create provider profile if it doesn't exist
      if (!providerProfileId) {
        const { data: created, error: createError } = await locals.supabase
          .from('provider_profiles')
          .insert({
            user_id: app.user_id,
            provider_type: 'individual',
            business_name: app.headline,
            description: app.bio,
            hourly_rate: app.hourly_rate,
            phone: app.phone,
            location: app.location
          })
          .select('id')
          .single();
        
        if (createError) {
          errors.push({ user_id: app.user_id, error: createError.message });
          continue;
        }
        providerProfileId = created.id;
        migrated++;
      } else {
        alreadyExisted++;
      }

      // Create provider category relationships
      if (Array.isArray(app.categories)) {
        for (const categoryId of app.categories) {
          // Check if relationship already exists
          const { data: existingRel } = await locals.supabase
            .from('provider_categories')
            .select('id')
            .eq('provider_id', providerProfileId)
            .eq('category_id', categoryId)
            .maybeSingle();
          
          if (!existingRel) {
            await locals.supabase
              .from('provider_categories')
              .insert({
                provider_id: providerProfileId,
                category_id: categoryId
              });
          }
        }
      }
    }

    return json({
      success: true,
      migrated,
      alreadyExisted,
      errors,
      message: `Migration completed. ${migrated} new providers created, ${alreadyExisted} already existed.`
    });
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}; 