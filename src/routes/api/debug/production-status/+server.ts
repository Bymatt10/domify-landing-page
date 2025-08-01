import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const startTime = Date.now();
  
  try {
    // Check environment variables in production
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      PRIVATE_SUPABASE_SERVICE_ROLE_KEY: process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      hasSupabaseUrl: !!process.env.PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.PUBLIC_SUPABASE_ANON_KEY
    };

    // Test database connection
    let dbTest = false;
    try {
      await supabase.from('customers').select('id').limit(1);
      dbTest = true;
    } catch (dbError) {
      console.error('DB test failed:', dbError);
    }

    // Test auth service
    let authTest = false;
    try {
      await supabase.auth.getUser();
      authTest = true;
    } catch (authError) {
      console.error('Auth test failed:', authError);
    }

    const totalTime = Date.now() - startTime;
    
    return json({
      success: envStatus.hasSupabaseUrl && envStatus.hasAnonKey && dbTest && authTest,
      timestamp: new Date().toISOString(),
      server: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        origin: url.origin,
        host: url.host
      },
      environment: envStatus,
      tests: {
        database: dbTest,
        auth: authTest,
        totalTime
      },
      oauth: {
        callbackUrl: `${url.origin}/auth/callback`,
        requiredRedirectUrls: [
          `${url.origin}/auth/callback`,
          'https://domify.app/auth/callback',
          'https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback'
        ]
      }
    });
    
  } catch (error) {
    console.error('Production status check failed:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      totalTime: Date.now() - startTime
    });
  }
};