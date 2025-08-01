import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] === Supabase Provider Check ===`);
    
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
    
    // Test 1: Check if we can access Supabase auth settings
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      results.tests.push({
        name: "Supabase Auth Access",
        status: sessionError ? "failed" : "success",
        details: {
          hasData: !!sessionData,
          hasSession: !!sessionData?.session,
          error: sessionError?.message || null,
          errorCode: sessionError?.status || null
        }
      });
    } catch (authError) {
      results.tests.push({
        name: "Supabase Auth Access",
        status: "error",
        details: {
          error: authError instanceof Error ? authError.message : String(authError)
        }
      });
    }
    
    // Test 2: Test OAuth URL generation with minimal options
    try {
      const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${url.origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      });
      
      let oauthUrl = null;
      let redirectUri = null;
      let stateParam = null;
      let codeChallenge = null;
      let clientId = null;
      let scope = null;
      
      if (oauthData?.url) {
        try {
          oauthUrl = new URL(oauthData.url);
          redirectUri = oauthUrl.searchParams.get('redirect_uri');
          stateParam = oauthUrl.searchParams.get('state');
          codeChallenge = oauthUrl.searchParams.get('code_challenge');
          clientId = oauthUrl.searchParams.get('client_id');
          scope = oauthUrl.searchParams.get('scope');
        } catch (urlError) {
          console.error('Error parsing OAuth URL:', urlError);
        }
      }
      
      results.tests.push({
        name: "OAuth URL Generation (Minimal)",
        status: oauthError ? "failed" : "success",
        details: {
          hasUrl: !!oauthData?.url,
          hasError: !!oauthError,
          error: oauthError?.message || null,
          redirectUri: redirectUri,
          stateParam: stateParam,
          codeChallenge: codeChallenge ? `${codeChallenge.substring(0, 10)}...` : null,
          clientId: clientId ? `${clientId.substring(0, 20)}...` : null,
          scope: scope,
          isSupabaseRedirect: redirectUri?.includes('supabase.co') || false,
          urlPreview: oauthData?.url ? oauthData.url.substring(0, 150) + "..." : null
        }
      });
      
    } catch (initError) {
      results.tests.push({
        name: "OAuth URL Generation (Minimal)",
        status: "error",
        details: {
          error: initError instanceof Error ? initError.message : String(initError)
        }
      });
    }
    
    // Test 3: Test OAuth URL generation with full options
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
      let scope = null;
      
      if (oauthData?.url) {
        try {
          oauthUrl = new URL(oauthData.url);
          redirectUri = oauthUrl.searchParams.get('redirect_uri');
          stateParam = oauthUrl.searchParams.get('state');
          codeChallenge = oauthUrl.searchParams.get('code_challenge');
          clientId = oauthUrl.searchParams.get('client_id');
          scope = oauthUrl.searchParams.get('scope');
        } catch (urlError) {
          console.error('Error parsing OAuth URL:', urlError);
        }
      }
      
      results.tests.push({
        name: "OAuth URL Generation (Full)",
        status: oauthError ? "failed" : "success",
        details: {
          hasUrl: !!oauthData?.url,
          hasError: !!oauthError,
          error: oauthError?.message || null,
          redirectUri: redirectUri,
          stateParam: stateParam,
          codeChallenge: codeChallenge ? `${codeChallenge.substring(0, 10)}...` : null,
          clientId: clientId ? `${clientId.substring(0, 20)}...` : null,
          scope: scope,
          isSupabaseRedirect: redirectUri?.includes('supabase.co') || false,
          urlPreview: oauthData?.url ? oauthData.url.substring(0, 150) + "..." : null
        }
      });
      
    } catch (initError) {
      results.tests.push({
        name: "OAuth URL Generation (Full)",
        status: "error",
        details: {
          error: initError instanceof Error ? initError.message : String(initError)
        }
      });
    }
    
    // Analysis
    const issues = [];
    const recommendations = [];
    
    // Check for missing state parameter
    const minimalTest = results.tests.find(t => t.name === "OAuth URL Generation (Minimal)");
    const fullTest = results.tests.find(t => t.name === "OAuth URL Generation (Full)");
    
    if (minimalTest && minimalTest.status === "success") {
      if (!minimalTest.details.stateParam) {
        issues.push("❌ Missing state parameter in minimal OAuth URL");
        recommendations.push("This indicates a fundamental PKCE configuration problem");
      }
      if (!minimalTest.details.clientId) {
        issues.push("❌ Missing client_id in OAuth URL");
        recommendations.push("Google provider may not be properly configured in Supabase");
      }
    }
    
    if (fullTest && fullTest.status === "success") {
      if (!fullTest.details.stateParam) {
        issues.push("❌ Missing state parameter in full OAuth URL");
        recommendations.push("PKCE state generation is not working");
      }
    }
    
    // Critical recommendations
    recommendations.push("");
    recommendations.push("🎯 CRITICAL: Check Supabase Google Provider Configuration");
    recommendations.push("1. Go to Supabase Dashboard → Auth → Providers → Google");
    recommendations.push("2. Verify that Google provider is ENABLED");
    recommendations.push("3. Verify that Client ID is set and not empty");
    recommendations.push("4. Verify that Client Secret is set and not empty");
    recommendations.push("5. Verify that Redirect URL is: https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback");
    recommendations.push("");
    recommendations.push("🎯 CRITICAL: Check Supabase Project Settings");
    recommendations.push("1. Go to Supabase Dashboard → Settings → API");
    recommendations.push("2. Verify that Project URL is correct");
    recommendations.push("3. Verify that API keys are correct");
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
      error: 'Unexpected error in Supabase provider check',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      timing: {
        totalTime: Date.now() - startTime
      },
      requestId
    });
  }
} 