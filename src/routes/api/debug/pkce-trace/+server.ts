import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] === PKCE Flow Trace ===`);
    
    const results = [];
    
    // Step 1: Test OAuth initiation
    results.push({
      step: 1,
      name: "OAuth Initiation Test",
      status: "testing"
    });
    
    try {
      // Get the OAuth URL without actually redirecting
      const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${url.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          skipBrowserRedirect: true // This prevents actual redirect
        }
      });
      
      results[0].status = oauthError ? "failed" : "success";
      results[0].details = {
        hasData: !!oauthData,
        hasUrl: !!oauthData?.url,
        hasProvider: !!oauthData?.provider,
        error: oauthError?.message || null,
        urlPreview: oauthData?.url ? `${oauthData.url.substring(0, 100)}...` : null
      };
      
    } catch (initError) {
      results[0].status = "error";
      results[0].details = {
        error: initError instanceof Error ? initError.message : String(initError)
      };
    }
    
    // Step 2: Test code exchange simulation
    results.push({
      step: 2,
      name: "Code Exchange Simulation",
      status: "testing"
    });
    
    // Get a test code from URL if provided
    const testCode = url.searchParams.get('code');
    
    if (testCode) {
      try {
        const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(testCode);
        
        results[1].status = exchangeError ? "failed" : "success";
        results[1].details = {
          hasData: !!exchangeData,
          hasSession: !!exchangeData?.session,
          hasUser: !!exchangeData?.user,
          error: exchangeError?.message || null,
          errorDetails: exchangeError ? {
            name: exchangeError.name,
            status: exchangeError.status,
            message: exchangeError.message
          } : null
        };
      } catch (exchangeErr) {
        results[1].status = "error";
        results[1].details = {
          error: exchangeErr instanceof Error ? exchangeErr.message : String(exchangeErr)
        };
      }
    } else {
      results[1].status = "skipped";
      results[1].details = {
        reason: "No test code provided. Add ?code=XXX to test exchange"
      };
    }
    
    // Step 3: Check current session state
    results.push({
      step: 3,
      name: "Session State Check",
      status: "testing"
    });
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      results[2].status = sessionError ? "failed" : "success";
      results[2].details = {
        hasSession: !!sessionData?.session,
        hasUser: !!sessionData?.session?.user,
        sessionExpiry: sessionData?.session?.expires_at || null,
        userEmail: sessionData?.session?.user?.email || null,
        error: sessionError?.message || null
      };
    } catch (sessionErr) {
      results[2].status = "error";
      results[2].details = {
        error: sessionErr instanceof Error ? sessionErr.message : String(sessionErr)
      };
    }
    
    // Step 4: Environment analysis
    results.push({
      step: 4,
      name: "Environment Analysis",
      status: "success",
      details: {
        environment: process.env.NODE_ENV,
        origin: url.origin,
        isProduction: url.origin.includes('domify.app'),
        isLocalhost: url.origin.includes('localhost'),
        supabaseUrl: process.env.PUBLIC_SUPABASE_URL ? 
          `${process.env.PUBLIC_SUPABASE_URL.substring(0, 30)}...` : 'NOT SET',
        hasAnonKey: !!process.env.PUBLIC_SUPABASE_ANON_KEY
      }
    });
    
    // Step 5: PKCE recommendations
    const pkceIssues = [];
    const pkceRecommendations = [];
    
    // Check for common PKCE issues
    if (url.origin.includes('domify.app')) {
      pkceRecommendations.push("✅ Production domain detected");
    } else {
      pkceIssues.push("⚠️ Not using production domain");
    }
    
    if (results[0].status === "failed") {
      pkceIssues.push("❌ OAuth initiation failed");
      pkceRecommendations.push("Check Google Cloud Console OAuth configuration");
    }
    
    if (testCode && results[1].status === "failed") {
      pkceIssues.push("❌ Code exchange failed");
      pkceRecommendations.push("This is likely the PKCE issue");
      
      const exchangeError = results[1].details?.error;
      if (exchangeError?.includes('invalid flow state') || 
          exchangeError?.includes('no valid flow state') ||
          exchangeError?.includes('code verifier') ||
          exchangeError?.includes('pkce')) {
        pkceRecommendations.push("🎯 CONFIRMED: This is a PKCE state mismatch");
        pkceRecommendations.push("Check if Google OAuth redirect URI matches Supabase exactly");
        pkceRecommendations.push("Verify domain verification in Google Cloud Console");
      }
    }
    
    results.push({
      step: 5,
      name: "PKCE Analysis",
      status: pkceIssues.length > 0 ? "issues" : "good",
      details: {
        issues: pkceIssues,
        recommendations: pkceRecommendations,
        criticalCheck: "Verify these URLs match EXACTLY:",
        urlsToCheck: [
          "Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs",
          "Supabase Dashboard → Auth → Providers → Google → Redirect URL",
          "Expected: https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback"
        ]
      }
    });
    
    return json({
      success: true,
      timestamp: new Date().toISOString(),
      requestId,
      summary: {
        totalSteps: results.length,
        passed: results.filter(r => r.status === "success").length,
        failed: results.filter(r => r.status === "failed").length,
        errors: results.filter(r => r.status === "error").length,
        skipped: results.filter(r => r.status === "skipped").length,
        issues: results.filter(r => r.status === "issues").length
      },
      results,
      instructions: {
        howToTest: "To test with a real OAuth code, add ?code=XXX to this URL",
        example: `${url.origin}/api/debug/pkce-trace?code=YOUR_OAUTH_CODE_HERE`,
        note: "You can get an OAuth code by starting the login process and copying it from the callback URL"
      },
      timing: {
        totalTime: Date.now() - startTime
      }
    });
    
  } catch (error) {
    return json({
      success: false,
      error: 'Unexpected error in PKCE trace',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      timing: {
        totalTime: Date.now() - startTime
      },
      requestId
    });
  }
}