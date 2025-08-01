import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const startTime = Date.now();
  
  try {
    const checks = {
      environment: false,
      database: false,
      auth: false,
      totalTime: 0
    };
    
    const issues: string[] = [];
    
    // 1. Environment Check
    const required = ['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY'];
    const missing = required.filter(env => !process.env[env]);
    
    if (missing.length === 0) {
      checks.environment = true;
    } else {
      issues.push(`Missing environment variables: ${missing.join(', ')}`);
    }
    
    // 2. Database Connection Check
    try {
      const dbStart = Date.now();
      await supabase.from('customers').select('id').limit(1);
      checks.database = true;
      console.log(`Database check passed in ${Date.now() - dbStart}ms`);
    } catch (dbError) {
      issues.push(`Database connection failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
    
    // 3. Auth Service Check
    try {
      const authStart = Date.now();
      await supabase.auth.getUser();
      checks.auth = true;
      console.log(`Auth service check passed in ${Date.now() - authStart}ms`);
    } catch (authError) {
      issues.push(`Auth service failed: ${authError instanceof Error ? authError.message : String(authError)}`);
    }
    
    checks.totalTime = Date.now() - startTime;
    
    const allHealthy = checks.environment && checks.database && checks.auth;
    
    return json({
      success: allHealthy,
      timestamp: new Date().toISOString(),
      checks,
      issues: issues.length > 0 ? issues : null,
      oauth: {
        callbackUrl: `${url.origin}/auth/callback`,
        redirectUrls: [
          `${url.origin}/auth/callback`,
          
          'https://domify.app/auth/callback'
        ],
        environment: {
          nodeEnv: process.env.NODE_ENV,
          origin: url.origin,
          supabaseUrl: process.env.PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT SET'
        }
      },
      recommendations: allHealthy 
        ? ['✅ All systems healthy! OAuth should work properly.']
        : [
            '❌ Issues detected. Please fix the following:',
            ...issues,
            '',
            'Additional steps:',
            '1. Verify Google OAuth configuration in Supabase Dashboard',
            '2. Check that your redirect URLs in Google Console include:',
            `   - ${url.origin}/auth/callback`,
            '   - https://domify.app/auth/callback',
            '3. Ensure environment variables are set in production'
          ]
    });
    
  } catch (error) {
    console.error('Error in OAuth health check:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      totalTime: Date.now() - startTime
    });
  }
};