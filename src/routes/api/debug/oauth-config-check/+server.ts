import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] === OAuth Config Check ===`);
    
    // Get current environment info
    const currentEnv = {
      NODE_ENV: process.env.NODE_ENV,
      origin: url.origin,
      hostname: url.hostname,
      protocol: url.protocol,
      isProduction: process.env.NODE_ENV === 'production'
    };
    
    // Check Supabase configuration
    const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
    
    const supabaseConfig = {
      url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NOT SET',
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      anonKeyLength: supabaseAnonKey?.length || 0
    };
    
    // Test Supabase auth configuration
    let authConfig = null;
    try {
      // Try to get auth settings (this might not work with anon key)
      const { data, error } = await supabase.auth.getSession();
      authConfig = {
        canGetSession: !error,
        sessionError: error?.message || null,
        hasSession: !!data.session
      };
    } catch (authError) {
      authConfig = {
        canGetSession: false,
        sessionError: authError instanceof Error ? authError.message : String(authError),
        hasSession: false
      };
    }
    
    // Check OAuth redirect URLs
    const expectedRedirectUrls = [
      'https://domify.app/auth/callback',
      'http://localhost:5173/auth/callback',
      'https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback'
    ];
    
    const currentCallbackUrl = `${url.origin}/auth/callback`;
    
    const redirectUrlCheck = {
      current: currentCallbackUrl,
      expected: expectedRedirectUrls,
      isExpected: expectedRedirectUrls.includes(currentCallbackUrl),
      isLocalhost: currentCallbackUrl.includes('localhost'),
      isProduction: currentCallbackUrl.includes('domify.app')
    };
    
    // Check for common OAuth configuration issues
    const issues = [];
    
    if (!supabaseConfig.hasUrl) {
      issues.push('Missing PUBLIC_SUPABASE_URL');
    }
    
    if (!supabaseConfig.hasAnonKey) {
      issues.push('Missing PUBLIC_SUPABASE_ANON_KEY');
    }
    
    if (!redirectUrlCheck.isExpected) {
      issues.push(`Unexpected callback URL: ${currentCallbackUrl}`);
    }
    
    if (currentEnv.isProduction && redirectUrlCheck.isLocalhost) {
      issues.push('Production environment using localhost callback');
    }
    
    if (!currentEnv.isProduction && redirectUrlCheck.isProduction) {
      issues.push('Development environment using production callback');
    }
    
    return json({
      success: true,
      timestamp: new Date().toISOString(),
      requestId,
      environment: currentEnv,
      supabase: supabaseConfig,
      auth: authConfig,
      redirectUrls: redirectUrlCheck,
      issues,
      hasIssues: issues.length > 0,
      recommendations: [
        'Verify Google Cloud Console OAuth 2.0 Client ID configuration',
        'Check Supabase Dashboard > Authentication > Providers > Google',
        'Ensure redirect URLs match exactly (including protocol and port)',
        'Verify domain verification in Google Cloud Console',
        'Check if Google OAuth is enabled in Supabase Dashboard'
      ],
      timing: {
        totalTime: Date.now() - startTime
      }
    });
    
  } catch (error) {
    return json({
      success: false,
      error: 'Unexpected error in OAuth config check',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      timing: {
        totalTime: Date.now() - startTime
      },
      requestId
    });
  }
} 