import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] === Supabase Domain Check ===`);
    
    const results = {
      timestamp: new Date().toISOString(),
      requestId,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        origin: url.origin,
        isProduction: url.origin.includes('domify.app')
      },
      supabase: {
        url: process.env.PUBLIC_SUPABASE_URL || 'NOT SET',
        anonKey: process.env.PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
        serviceRoleKey: process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
      },
      tests: []
    };
    
    // Test 1: Parse Supabase URL
    try {
      const supabaseUrl = new URL(process.env.PUBLIC_SUPABASE_URL || '');
      results.tests.push({
        name: "Supabase URL Parsing",
        status: "success",
        details: {
          protocol: supabaseUrl.protocol,
          hostname: supabaseUrl.hostname,
          port: supabaseUrl.port || 'default',
          pathname: supabaseUrl.pathname,
          fullUrl: process.env.PUBLIC_SUPABASE_URL,
          isHttps: supabaseUrl.protocol === 'https:',
          isSupabaseDomain: supabaseUrl.hostname.includes('supabase.co')
        }
      });
    } catch (urlError) {
      results.tests.push({
        name: "Supabase URL Parsing",
        status: "failed",
        details: {
          error: urlError instanceof Error ? urlError.message : String(urlError),
          url: process.env.PUBLIC_SUPABASE_URL
        }
      });
    }
    
    // Test 2: Test Supabase connection
    try {
      const { data, error } = await supabase.auth.getSession();
      
      results.tests.push({
        name: "Supabase Connection Test",
        status: error ? "failed" : "success",
        details: {
          hasData: !!data,
          hasSession: !!data?.session,
          error: error?.message || null,
          errorCode: error?.status || null
        }
      });
    } catch (connError) {
      results.tests.push({
        name: "Supabase Connection Test",
        status: "error",
        details: {
          error: connError instanceof Error ? connError.message : String(connError)
        }
      });
    }
    
    // Test 3: Test OAuth URL generation with detailed analysis
    try {
      const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${url.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          skipBrowserRedirect: true
        }
      });
      
      let oauthUrl = null;
      let redirectUri = null;
      let stateParam = null;
      let codeChallenge = null;
      let clientId = null;
      
      if (oauthData?.url) {
        try {
          oauthUrl = new URL(oauthData.url);
          redirectUri = oauthUrl.searchParams.get('redirect_uri');
          stateParam = oauthUrl.searchParams.get('state');
          codeChallenge = oauthUrl.searchParams.get('code_challenge');
          clientId = oauthUrl.searchParams.get('client_id');
        } catch (urlError) {
          console.error('Error parsing OAuth URL:', urlError);
        }
      }
      
      results.tests.push({
        name: "OAuth URL Detailed Analysis",
        status: oauthError ? "failed" : "success",
        details: {
          hasUrl: !!oauthData?.url,
          hasError: !!oauthError,
          error: oauthError?.message || null,
          redirectUri: redirectUri,
          stateParam: stateParam,
          codeChallenge: codeChallenge ? `${codeChallenge.substring(0, 10)}...` : null,
          clientId: clientId ? `${clientId.substring(0, 20)}...` : null,
          isSupabaseRedirect: redirectUri?.includes('supabase.co') || false,
          urlPreview: oauthData?.url ? oauthData.url.substring(0, 150) + "..." : null,
          expectedRedirectUri: 'https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback',
          redirectUriMatches: redirectUri === 'https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback'
        }
      });
      
    } catch (initError) {
      results.tests.push({
        name: "OAuth URL Detailed Analysis",
        status: "error",
        details: {
          error: initError instanceof Error ? initError.message : String(initError)
        }
      });
    }
    
    // Analysis
    const issues = [];
    const recommendations = [];
    
    // Check Supabase URL
    const urlTest = results.tests.find(t => t.name === "Supabase URL Parsing");
    if (urlTest && urlTest.status === "success") {
      const details = urlTest.details;
      if (!details.isHttps) {
        issues.push("❌ Supabase URL is not HTTPS");
        recommendations.push("Supabase URL should use HTTPS protocol");
      }
      if (!details.isSupabaseDomain) {
        issues.push("❌ Supabase URL is not a valid Supabase domain");
        recommendations.push("Check if the Supabase URL is correct");
      }
    }
    
    // Check OAuth URL
    const oauthTest = results.tests.find(t => t.name === "OAuth URL Detailed Analysis");
    if (oauthTest && oauthTest.status === "success") {
      const details = oauthTest.details;
      if (!details.stateParam) {
        issues.push("❌ Missing state parameter in OAuth URL");
        recommendations.push("This indicates a PKCE configuration problem");
      }
      if (!details.redirectUriMatches) {
        issues.push("❌ Redirect URI does not match expected");
        recommendations.push(`Expected: ${details.expectedRedirectUri}`);
        recommendations.push(`Actual: ${details.redirectUri}`);
      }
      if (!details.isSupabaseRedirect) {
        issues.push("❌ OAuth is not using Supabase redirect URI");
        recommendations.push("Check Supabase Dashboard configuration");
      }
    }
    
    // Critical recommendations
    recommendations.push("");
    recommendations.push("🎯 CRITICAL: Verify Supabase Project Settings");
    recommendations.push("1. Go to Supabase Dashboard → Settings → API");
    recommendations.push("2. Check if the Project URL matches your environment variables");
    recommendations.push("3. Verify the Project API keys are correct");
    recommendations.push("");
    recommendations.push("🎯 CRITICAL: Check Supabase Auth Settings");
    recommendations.push("1. Go to Supabase Dashboard → Auth → URL Configuration");
    recommendations.push("2. Site URL should be: https://zdlwmjpviualqyikgzlz.supabase.co");
    recommendations.push("3. Redirect URLs should include: https://domify.app/auth/callback");
    
    return json({
      success: true,
      results,
      issues,
      recommendations,
      summary: {
        totalTests: results.tests.length,
        passed: results.tests.filter(t => t.status === "success").length,
        failed: results.tests.filter(t => t.status === "failed").length,
        errors: results.tests.filter(t => t.status === "error").length,
        hasIssues: issues.length > 0
      },
      timing: {
        totalTime: Date.now() - startTime
      }
    });
    
  } catch (error) {
    return json({
      success: false,
      error: 'Unexpected error in Supabase domain check',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      timing: {
        totalTime: Date.now() - startTime
      },
      requestId
    });
  }
} 