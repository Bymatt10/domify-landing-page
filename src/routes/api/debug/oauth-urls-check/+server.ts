import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] === OAuth URLs Check ===`);
    
    const results = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        origin: url.origin,
        isProduction: url.origin.includes('domify.app')
      },
      supabase: {
        url: process.env.PUBLIC_SUPABASE_URL ? 
          `${process.env.PUBLIC_SUPABASE_URL.substring(0, 30)}...` : 'NOT SET',
        hasUrl: !!process.env.PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.PUBLIC_SUPABASE_ANON_KEY
      },
      oauthUrls: {
        currentCallback: `${url.origin}/auth/callback`,
        expectedSupabaseCallback: 'https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback',
        expectedLocalhost: 'http://localhost:5173/auth/callback',
        expectedProduction: 'https://domify.app/auth/callback'
      },
      testResults: []
    };
    
    // Test 1: Generate OAuth URL
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
      
      results.testResults.push({
        test: "OAuth URL Generation",
        status: oauthError ? "failed" : "success",
        details: {
          hasUrl: !!oauthData?.url,
          urlPreview: oauthData?.url ? oauthData.url.substring(0, 150) + "..." : null,
          error: oauthError?.message || null,
          provider: oauthData?.provider || null
        }
      });
      
      // Extract redirect_uri from the generated URL
      if (oauthData?.url) {
        try {
          const oauthUrl = new URL(oauthData.url);
          const redirectUri = oauthUrl.searchParams.get('redirect_uri');
          results.oauthUrls.actualRedirectUri = redirectUri;
          
          results.testResults.push({
            test: "Redirect URI Analysis",
            status: "success",
            details: {
              actualRedirectUri: redirectUri,
              expectedSupabaseUri: 'https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback',
              matchesExpected: redirectUri === 'https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback',
              isSupabaseDomain: redirectUri?.includes('supabase.co') || false
            }
          });
        } catch (urlError) {
          results.testResults.push({
            test: "Redirect URI Analysis",
            status: "error",
            details: {
              error: urlError instanceof Error ? urlError.message : String(urlError)
            }
          });
        }
      }
      
    } catch (initError) {
      results.testResults.push({
        test: "OAuth URL Generation",
        status: "error",
        details: {
          error: initError instanceof Error ? initError.message : String(initError)
        }
      });
    }
    
    // Test 2: Check session state
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      results.testResults.push({
        test: "Session State",
        status: sessionError ? "failed" : "success",
        details: {
          hasSession: !!sessionData?.session,
          hasUser: !!sessionData?.session?.user,
          error: sessionError?.message || null
        }
      });
    } catch (sessionErr) {
      results.testResults.push({
        test: "Session State",
        status: "error",
        details: {
          error: sessionErr instanceof Error ? sessionErr.message : String(sessionErr)
        }
      });
    }
    
    // Analysis
    const issues = [];
    const recommendations = [];
    
    // Check if Supabase URL is being used
    if (results.oauthUrls.actualRedirectUri) {
      if (!results.oauthUrls.actualRedirectUri.includes('supabase.co')) {
        issues.push("❌ OAuth is not using Supabase redirect URI");
        recommendations.push("This indicates a configuration problem in Supabase Dashboard");
      } else {
        recommendations.push("✅ OAuth is correctly using Supabase redirect URI");
      }
    }
    
    // Check environment
    if (results.environment.isProduction) {
      recommendations.push("✅ Production environment detected");
    } else {
      issues.push("⚠️ Not in production environment");
    }
    
    // Check Supabase config
    if (!results.supabase.hasUrl || !results.supabase.hasAnonKey) {
      issues.push("❌ Missing Supabase configuration");
      recommendations.push("Check environment variables");
    } else {
      recommendations.push("✅ Supabase configuration present");
    }
    
    // Critical recommendations
    recommendations.push("");
    recommendations.push("🎯 CRITICAL: Verify these URLs in Google Cloud Console:");
    recommendations.push("1. https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback");
    recommendations.push("2. https://domify.app/auth/callback");
    recommendations.push("3. http://localhost:5173/auth/callback");
    recommendations.push("");
    recommendations.push("🎯 CRITICAL: Verify in Supabase Dashboard:");
    recommendations.push("Auth → Providers → Google → Redirect URL should be:");
    recommendations.push("https://zdlwmjpviualqyikgzlz.supabase.co/auth/v1/callback");
    
    return json({
      success: true,
      timestamp: new Date().toISOString(),
      requestId,
      results,
      issues,
      recommendations,
      summary: {
        totalTests: results.testResults.length,
        passed: results.testResults.filter(r => r.status === "success").length,
        failed: results.testResults.filter(r => r.status === "failed").length,
        errors: results.testResults.filter(r => r.status === "error").length,
        hasIssues: issues.length > 0
      },
      timing: {
        totalTime: Date.now() - startTime
      }
    });
    
  } catch (error) {
    return json({
      success: false,
      error: 'Unexpected error in OAuth URLs check',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      timing: {
        totalTime: Date.now() - startTime
      },
      requestId
    });
  }
} 