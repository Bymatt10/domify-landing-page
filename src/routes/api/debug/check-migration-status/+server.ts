import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin.js';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      needsMigration: false,
      existingTables: [] as string[],
      missingTables: [] as string[],
      instructions: [] as string[]
    };

    // Tablas que deberían existir según nuestro esquema
    const requiredTables = [
      'customers',
      'categories', 
      'provider_profiles',
      'provider_categories',
      'services',
      'bookings',
      'payments',
      'reviews',
      'provider_applications',
      'provider_application_categories',
      'notifications'
    ];

    // Verificar qué tablas existen
    try {
      const { data, error } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', requiredTables);

      if (error) {
        return json({
          status: 'ERROR',
          message: 'Cannot access database schema',
          error: error.message,
          instructions: [
            'There is a fundamental permission issue with your Supabase connection.',
            'Please verify:',
            '1. Your PRIVATE_SUPABASE_SERVICE_ROLE_KEY is correct',
            '2. Your PUBLIC_SUPABASE_URL is correct', 
            '3. Your Supabase project is active and accessible'
          ]
        }, { status: 500 });
      }

      results.existingTables = data?.map(t => t.table_name) || [];
      results.missingTables = requiredTables.filter(table => 
        !results.existingTables.includes(table)
      );
      
      results.needsMigration = results.missingTables.length > 0;

      if (results.needsMigration) {
        results.instructions = [
          '🔴 DATABASE MIGRATION REQUIRED',
          '',
          `Missing tables: ${results.missingTables.join(', ')}`,
          '',
          'To fix this issue:',
          '1. Go to your Supabase Dashboard: https://supabase.com/dashboard/projects',
          '2. Select your project (zdlwmjpviualqyikgzlz)',
          '3. Go to "SQL Editor" in the left sidebar',
          '4. Copy the contents of the file "bd-simplified.sql" from your project root',
          '5. Paste it into the SQL Editor and click "Run"',
          '6. Wait for all statements to execute successfully',
          '7. Refresh this endpoint to verify the migration completed',
          '',
          'Alternative method:',
          '1. Use the Supabase CLI: npx supabase db push',
          '2. Or manually create the missing tables using the SQL Editor'
        ];
      } else {
        results.instructions = [
          '✅ DATABASE IS READY',
          '',
          `All required tables exist: ${results.existingTables.join(', ')}`,
          '',
          'Your database schema is properly set up!',
          'The RLS permission issues should now be resolved.'
        ];
      }

      return json({
        status: results.needsMigration ? 'MIGRATION_NEEDED' : 'READY',
        message: results.needsMigration ? 'Database migration required' : 'Database is ready',
        ...results
      });

    } catch (error) {
      return json({
        status: 'ERROR',
        message: 'Failed to check migration status',
        error: error instanceof Error ? error.message : 'Unknown error',
        instructions: [
          'Cannot connect to database.',
          'Please check your Supabase connection settings.',
          'Verify your environment variables are correct.'
        ]
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error checking migration status:', error);
    return json({
      status: 'ERROR',
      message: 'Failed to check migration status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 