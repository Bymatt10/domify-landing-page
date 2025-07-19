import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase-admin.js';

import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';
export const GET: RequestHandler = async ({ url }) => {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      checks: [] as any[]
    };

    // 1. Verificar conexión básica
    try {
      const { data, error } = await supabaseAdmin
        .from('provider_applications')
        .select('count(*)', { count: 'exact', head: true });
      
      results.checks.push({
        name: 'Basic Connection',
        status: error ? 'FAILED' : 'PASSED',
        details: error ? error.message : `Connection successful`,
        data: error ? null : data
      });
    } catch (error) {
      results.checks.push({
        name: 'Basic Connection',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 2. Verificar permisos de lectura sin filtros
    try {
      const { data, error } = await supabaseAdmin
        .from('provider_applications')
        .select('id, status, user_id')
        .limit(1);
      
      results.checks.push({
        name: 'Read Permissions',
        status: error ? 'FAILED' : 'PASSED',
        details: error ? error.message : `Can read ${data?.length || 0} records`,
        data: error ? null : data
      });
    } catch (error) {
      results.checks.push({
        name: 'Read Permissions',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 3. Verificar si la tabla existe
    try {
      const { data, error } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'provider_applications');
      
      results.checks.push({
        name: 'Table Exists',
        status: data && data.length > 0 ? 'PASSED' : 'FAILED',
        details: data && data.length > 0 ? 'Table exists' : 'Table not found'
      });
    } catch (error) {
      results.checks.push({
        name: 'Table Exists',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 4. Verificar políticas RLS
    try {
      const { data, error } = await supabaseAdmin
        .from('pg_policies')
        .select('policyname, tablename, permissive, roles')
        .eq('tablename', 'provider_applications');
      
      results.checks.push({
        name: 'RLS Policies',
        status: error ? 'FAILED' : 'PASSED',
        details: error ? error.message : `Found ${data?.length || 0} policies`,
        data: error ? null : data
      });
    } catch (error) {
      results.checks.push({
        name: 'RLS Policies',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 5. Verificar variables de entorno (corregido)
    const envCheck = {
      SUPABASE_URL: !!SUPABASE_URL,
      SUPABASE_URL_VALUE: SUPABASE_URL?.substring(0, 30) + '...',
      SERVICE_ROLE_KEY: !!SERVICE_ROLE_KEY,
      SERVICE_ROLE_KEY_VALUE: SERVICE_ROLE_KEY?.substring(0, 30) + '...',
      NODE_ENV: process.env.NODE_ENV
    };

    results.checks.push({
      name: 'Environment Variables',
      status: envCheck.SUPABASE_URL && envCheck.SERVICE_ROLE_KEY ? 'PASSED' : 'FAILED',
      details: envCheck
    });

    // 6. Test de conexión directa con variables
    try {
      const { createClient } = await import('@supabase/supabase-js');

// Get environment variables with fallbacks
const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();
const SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

      const testClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      const { data, error } = await testClient
        .from('provider_applications')
        .select('count(*)', { count: 'exact', head: true });

      results.checks.push({
        name: 'Direct Connection Test',
        status: error ? 'FAILED' : 'PASSED',
        details: error ? error.message : 'Direct connection successful'
      });
    } catch (error) {
      results.checks.push({
        name: 'Direct Connection Test',
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    const overallStatus = results.checks.every(check => check.status === 'PASSED') ? 'ALL_PASSED' : 'SOME_FAILED';

    return json({
      status: overallStatus,
      message: `RLS Permissions Check Complete - ${overallStatus}`,
      ...results
    });

  } catch (error) {
    console.error('Error in RLS permissions check:', error);
    return json({
      status: 'ERROR',
      message: 'Failed to complete RLS permissions check',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}; 