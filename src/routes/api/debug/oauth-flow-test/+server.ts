import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  try {
    // Test the exact OAuth flow that's failing
    const testResults = {
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.PUBLIC_SUPABASE_ANON_KEY,
        supabaseUrl: process.env.PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT SET'
      },
      supabase: {
        canConnect: false,
        authService: false,
        error: null
      },
      oauth: {
        redirectUrl: `${url.origin}/auth/callback`,
        expectedUrls: [
          `${url.origin}/auth/callback`,
          'https://domify.app/auth/callback',
          'https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback'
        ]
      }
    };

    // Test Supabase connection
    try {
      await supabase.from('customers').select('id').limit(1);
      testResults.supabase.canConnect = true;
    } catch (dbError) {
      testResults.supabase.error = dbError instanceof Error ? dbError.message : String(dbError);
    }

    // Test auth service
    try {
      await supabase.auth.getUser();
      testResults.supabase.authService = true;
    } catch (authError) {
      // This might fail if no user is logged in, which is expected
      console.log('Auth service test (expected to fail without user):', authError);
    }

    return json({
      success: testResults.supabase.canConnect,
      timestamp: new Date().toISOString(),
      results: testResults,
      recommendations: [
        '1. If canConnect is false: Database connection issue',
        '2. If authService is false: Auth service issue', 
        '3. Check that Google OAuth redirect URLs match exactly',
        '4. Verify Supabase Google provider is enabled',
        '5. Test OAuth flow manually and check server logs'
      ]
    });
    
  } catch (error) {
    console.error('OAuth flow test failed:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}; 