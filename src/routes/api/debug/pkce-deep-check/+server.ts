import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] === Deep PKCE Check ===`);
    
    const results = {
      timestamp: new Date().toISOString(),
      requestId,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        origin: url.origin,
        isProduction: url.origin.includes('domify.app')
      },
      tests: []
    };
    
    // Test 1: Supabase Configuration
    const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
    
    results.tests.push({
      name: "Supabase Configuration",
      status: (supabaseUrl && supabaseAnonKey) ? "success" : "failed",
      details: {
        hasUrl: !!supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : null,
        anonKeyLength: supabaseAnonKey?.length || 0
      }
    });
    
    // Test 2: OAuth URL Generation
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
      
      if (oauthData?.url) {
        try {
          oauthUrl = new URL(oauthData.url);
          redirectUri = oauthUrl.searchParams.get('redirect_uri');
          stateParam = oauthUrl.searchParams.get('state');
          codeChallenge = oauthUrl.searchParams.get('code_challenge');
        } catch (urlError) {
          console.error('Error parsing OAuth URL:', urlError);
        }
      }
      
      results.tests.push({
        name: "OAuth URL Generation",
        status: oauthError ? "failed" : "success",
        details: {
          hasUrl: !!oauthData?.url,
          hasError: !!oauthError,
          error: oauthError?.message || null,
          redirectUri: redirectUri,
          stateParam: stateParam ? `${stateParam.substring(0, 10)}...` : null,
          codeChallenge: codeChallenge ? `${codeChallenge.substring(0, 10)}...` : null,
          isSupabaseRedirect: redirectUri?.includes('supabase.co') || false,
          urlPreview: oauthData?.url ? oauthData.url.substring(0, 100) + "..." : null
        }
      });
      
    } catch (initError) {
      results.tests.push({
        name: "OAuth URL Generation",
        status: "error",
        details: {
          error: initError instanceof Error ? initError.message : String(initError)
        }
      });
    }
    
    // Test 3: Session State
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      results.tests.push({
        name: "Session State",
        status: sessionError ? "failed" : "success",
        details: {
          hasSession: !!sessionData?.session,
          hasUser: !!sessionData?.session?.user,
          sessionExpiry: sessionData?.session?.expires_at || null,
          error: sessionError?.message || null
        }
      });
    } catch (sessionErr) {
      results.tests.push({
        name: "Session State",
        status: "error",
        details: {
          error: sessionErr instanceof Error ? sessionErr.message : String(sessionErr)
        }
      });
    }
    
    // Test 4: Code Exchange Test (if code provided)
    const testCode = url.searchParams.get('code');
    if (testCode) {
      try {
        const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(testCode);
        
        results.tests.push({
          name: "Code Exchange Test",
          status: exchangeError ? "failed" : "success",
          details: {
            hasData: !!exchangeData,
            hasSession: !!exchangeData?.session,
            hasUser: !!exchangeData?.user,
            error: exchangeError?.message || null,
            errorDetails: exchangeError ? {
              name: exchangeError.name,
              status: exchangeError.status,
              message: exchangeError.message
            } : null
          }
        });
      } catch (exchangeErr) {
        results.tests.push({
          name: "Code Exchange Test",
          status: "error",
          details: {
            error: exchangeErr instanceof Error ? exchangeErr.message : String(exchangeErr)
          }
        });
      }
    } else {
      results.tests.push({
        name: "Code Exchange Test",
        status: "skipped",
        details: {
          reason: "No test code provided. Add ?code=XXX to test exchange"
        }
      });
    }
    
    // Analysis
    const issues = [];
    const recommendations = [];
    
    // Check for specific issues
    const oauthTest = results.tests.find(t => t.name === "OAuth URL Generation");
    if (oauthTest && oauthTest.status === "success") {
      const redirectUri = oauthTest.details.redirectUri;
      if (redirectUri && !redirectUri.includes('supabase.co')) {
        issues.push("❌ OAuth not using Supabase redirect URI");
        recommendations.push("Check Supabase Dashboard → Auth → URL Configuration");
        recommendations.push("Site URL should be: https://zdlwmjpviualqyikgzlz.supabase.co");
      }
      
      if (!oauthTest.details.stateParam) {
        issues.push("❌ Missing state parameter in OAuth URL");
        recommendations.push("This indicates a PKCE configuration problem");
      }
      
      if (!oauthTest.details.codeChallenge) {
        issues.push("❌ Missing code_challenge parameter");
        recommendations.push("PKCE is not properly configured");
      }
    }
    
    if (oauthTest && oauthTest.status === "failed") {
      issues.push("❌ OAuth URL generation failed");
      recommendations.push("Check Google provider configuration in Supabase Dashboard");
    }
    
    // Critical recommendations
    recommendations.push("");
    recommendations.push("🎯 CRITICAL CHECKS:");
    recommendations.push("1. Supabase Dashboard → Auth → URL Configuration:");
    recommendations.push("   Site URL: https://zdlwmjpviualqyikgzlz.supabase.co");
    recommendations.push("");
    recommendations.push("2. Supabase Dashboard → Auth → Providers → Google:");
    recommendations.push("   Redirect URL: https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback");
    recommendations.push("");
    recommendations.push("3. Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs:");
    recommendations.push("   https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback");
    recommendations.push("   https://domify.app/auth/callback");
    recommendations.push("   http://localhost:5173/auth/callback");
    
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
        skipped: results.tests.filter(t => t.status === "skipped").length,
        hasIssues: issues.length > 0
      },
      timing: {
        totalTime: Date.now() - startTime
      }
    });
    
  } catch (error) {
    return json({
      success: false,
      error: 'Unexpected error in deep PKCE check',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      timing: {
        totalTime: Date.now() - startTime
      },
      requestId
    });
  }
} 