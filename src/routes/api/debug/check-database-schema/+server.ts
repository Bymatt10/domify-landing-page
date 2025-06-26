import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin.js';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      checks: [] as any[]
    };

    // 1. Verificar qué esquemas están disponibles
    try {
      const { data, error } = await supabaseAdmin
        .from('information_schema.schemata')
        .select('schema_name')
        .order('schema_name');
      
      results.checks.push({
        name: 'Available Schemas',
        status: error ? 'FAILED' : 'PASSED',
        details: error ? error.message : `Found ${data?.length || 0} schemas`,
        data: error ? null : data?.map(s => s.schema_name)
      });
    } catch (error) {
      results.checks.push({
        name: 'Available Schemas',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 2. Verificar qué tablas están en el esquema público
    try {
      const { data, error } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .order('table_name');
      
      results.checks.push({
        name: 'Public Schema Tables',
        status: error ? 'FAILED' : 'PASSED',
        details: error ? error.message : `Found ${data?.length || 0} tables in public schema`,
        data: error ? null : data
      });
    } catch (error) {
      results.checks.push({
        name: 'Public Schema Tables',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 3. Buscar tablas que contengan "provider" o "application"
    try {
      const { data, error } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_schema, table_name, table_type')
        .or('table_name.ilike.%provider%,table_name.ilike.%application%')
        .order('table_schema, table_name');
      
      results.checks.push({
        name: 'Provider/Application Tables',
        status: error ? 'FAILED' : 'PASSED',
        details: error ? error.message : `Found ${data?.length || 0} related tables`,
        data: error ? null : data
      });
    } catch (error) {
      results.checks.push({
        name: 'Provider/Application Tables',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 4. Verificar permisos específicos del service role
    try {
      const { data, error } = await supabaseAdmin
        .rpc('current_user');
      
      results.checks.push({
        name: 'Current Database User',
        status: error ? 'FAILED' : 'PASSED',
        details: error ? error.message : `Connected as: ${data}`,
        data: error ? null : data
      });
    } catch (error) {
      results.checks.push({
        name: 'Current Database User',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 5. Test de consulta básica a una tabla del sistema
    try {
      const { data, error } = await supabaseAdmin
        .from('pg_tables')
        .select('schemaname, tablename')
        .eq('schemaname', 'public')
        .limit(5);
      
      results.checks.push({
        name: 'System Table Access',
        status: error ? 'FAILED' : 'PASSED',
        details: error ? error.message : `Can access system tables`,
        data: error ? null : data
      });
    } catch (error) {
      results.checks.push({
        name: 'System Table Access',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 6. Verificar conexión con una consulta SQL simple
    try {
      const { data, error } = await supabaseAdmin
        .rpc('version');
      
      results.checks.push({
        name: 'Database Version',
        status: error ? 'FAILED' : 'PASSED',
        details: error ? error.message : 'Database connection working',
        data: error ? null : data
      });
    } catch (error) {
      results.checks.push({
        name: 'Database Version',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    const overallStatus = results.checks.some(check => check.status === 'PASSED') ? 'SOME_PASSED' : 'ALL_FAILED';

    return json({
      status: overallStatus,
      message: `Database Schema Check Complete - ${overallStatus}`,
      ...results
    });

  } catch (error) {
    console.error('Error in database schema check:', error);
    return json({
      status: 'ERROR',
      message: 'Failed to complete database schema check',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 