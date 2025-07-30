import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  try {
    const testCode = url.searchParams.get('code') || 'fb4c06f5-1cc9-4876-a75c-8a9c1cdcdaec';
    
    console.log(`🧪 Testing code exchange with: ${testCode}`);
    
    // Try to exchange the code like the real callback does
    const exchangeStartTime = Date.now();
    const { data, error } = await supabase.auth.exchangeCodeForSession(testCode);
    const exchangeTime = Date.now() - exchangeStartTime;
    
    const result = {
      testCode,
      codeLength: testCode.length,
      isUuidFormat: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(testCode),
      exchangeResult: {
        success: !error,
        timeMs: exchangeTime,
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error ? {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error
        } : null
      },
      recommendation: null
    };
    
    if (result.isUuidFormat) {
      result.recommendation = "This code appears to be a UUID, not a valid OAuth authorization code. Check OAuth provider configuration.";
    }
    
    if (error) {
      result.recommendation = `Exchange failed: ${error.message}. This confirms the UUID-like codes are invalid.`;
    }
    
    return json(result);
    
  } catch (e) {
    console.error('Error testing code exchange:', e);
    return json({
      success: false,
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : null
    });
  }
}; 