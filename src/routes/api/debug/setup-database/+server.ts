import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin.js';
import { readFileSync } from 'fs';
import { join } from 'path';

export const POST: RequestHandler = async ({ url }) => {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return json({
        status: 'ERROR',
        message: 'Database setup only allowed in development environment'
      }, { status: 403 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      steps: [] as any[]
    };

    // Leer el archivo SQL
    let sqlContent: string;
    try {
      sqlContent = readFileSync(join(process.cwd(), 'bd-simplified.sql'), 'utf-8');
      results.steps.push({
        name: 'Read SQL File',
        status: 'PASSED',
        details: `SQL file loaded (${sqlContent.length} characters)`
      });
    } catch (error) {
      results.steps.push({
        name: 'Read SQL File',
        status: 'FAILED',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return json({
        status: 'ERROR',
        message: 'Could not read SQL file',
        ...results
      }, { status: 500 });
    }

    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== '')
      .map(stmt => stmt + ';');

    results.steps.push({
      name: 'Parse SQL Statements',
      status: 'PASSED',
      details: `Found ${statements.length} SQL statements`
    });

    // Ejecutar cada statement
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Usar rpc para ejecutar SQL directo
        const { data, error } = await supabaseAdmin.rpc('exec_sql', {
          sql_query: statement
        });

        if (error) {
          errorCount++;
          errors.push({
            statement: i + 1,
            sql: statement.substring(0, 100) + '...',
            error: error.message
          });
        } else {
          successCount++;
        }
      } catch (error) {
        errorCount++;
        errors.push({
          statement: i + 1,
          sql: statement.substring(0, 100) + '...',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    results.steps.push({
      name: 'Execute SQL Statements',
      status: errorCount === 0 ? 'PASSED' : 'PARTIAL',
      details: `${successCount} successful, ${errorCount} errors`,
      data: errors.length > 0 ? errors : null
    });

    // Verificar que las tablas principales fueron creadas
    try {
      const { data, error } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['provider_applications', 'categories', 'customers', 'provider_profiles']);

      const createdTables = data?.map(t => t.table_name) || [];
      
      results.steps.push({
        name: 'Verify Tables Created',
        status: createdTables.length >= 4 ? 'PASSED' : 'FAILED',
        details: `Created tables: ${createdTables.join(', ')}`,
        data: createdTables
      });
    } catch (error) {
      results.steps.push({
        name: 'Verify Tables Created',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    const overallStatus = results.steps.every(step => step.status === 'PASSED') ? 'SUCCESS' : 
                         results.steps.some(step => step.status === 'PASSED') ? 'PARTIAL' : 'FAILED';

    return json({
      status: overallStatus,
      message: `Database setup complete - ${overallStatus}`,
      ...results
    });

  } catch (error) {
    console.error('Error in database setup:', error);
    return json({
      status: 'ERROR',
      message: 'Failed to setup database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 