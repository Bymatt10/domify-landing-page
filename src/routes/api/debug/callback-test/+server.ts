import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] === Callback Test Debug ===`);
    
    // Test 1: Environment validation
    const required = ['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY'];
    const missing = required.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      return json({
        success: false,
        error: 'Missing environment variables',
        missing,
        requestId
      });
    }
    
    // Test 2: Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('customers')
      .select('id')
      .limit(1);
    
    if (testError) {
      return json({
        success: false,
        error: 'Database connection failed',
        details: testError.message,
        requestId
      });
    }
    
    // Test 3: Auth service
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return json({
        success: false,
        error: 'Auth service failed',
        details: sessionError.message,
        requestId
      });
    }
    
    // Test 4: Simulate OAuth callback logic
    const mockCode = 'test-code-' + Date.now();
    
    try {
      // This should fail with invalid code, but we want to see the error
      const { data, error } = await supabase.auth.exchangeCodeForSession(mockCode);
      
      return json({
        success: true,
        message: 'Callback logic test completed',
        testResults: {
          environment: 'OK',
          database: 'OK',
          auth: 'OK',
          exchangeCode: error ? 'Expected failure (invalid code)' : 'Unexpected success',
          errorMessage: error?.message || 'No error',
          errorStatus: error?.status || 'No status'
        },
        timing: {
          totalTime: Date.now() - startTime
        },
        requestId
      });
      
    } catch (exchangeError) {
      return json({
        success: true,
        message: 'Callback logic test completed with expected error',
        testResults: {
          environment: 'OK',
          database: 'OK',
          auth: 'OK',
          exchangeCode: 'Expected failure (exception)',
          errorMessage: exchangeError instanceof Error ? exchangeError.message : String(exchangeError),
          errorType: exchangeError instanceof Error ? exchangeError.constructor.name : typeof exchangeError
        },
        timing: {
          totalTime: Date.now() - startTime
        },
        requestId
      });
    }
    
  } catch (error) {
    return json({
      success: false,
      error: 'Unexpected error in callback test',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      timing: {
        totalTime: Date.now() - startTime
      },
      requestId
    });
  }
} 