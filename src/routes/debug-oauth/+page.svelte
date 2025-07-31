<script lang="ts">
  import { onMount } from 'svelte';
  
  let healthCheck: any = null;
  let loading = true;
  let error = '';
  
  onMount(async () => {
    try {
      const response = await fetch('/api/debug/oauth-health-check');
      const data = await response.json();
      healthCheck = data;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Error checking OAuth health';
    } finally {
      loading = false;
    }
  });
  
  function getStatusIcon(status: boolean) {
    return status ? '✅' : '❌';
  }
  
  function getStatusText(status: boolean) {
    return status ? 'PASSED' : 'FAILED';
  }
</script>

<svelte:head>
  <title>OAuth Health Check - Domify</title>
</svelte:head>

<div class="container mx-auto p-6 max-w-4xl">
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">OAuth Health Check</h1>
    
    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <p class="text-blue-700">
        <strong>Purpose:</strong> This page helps diagnose Google OAuth login issues and 502 errors.
        Use this to verify that your OAuth configuration is working properly.
      </p>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Running health checks...</span>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 class="text-red-800 font-semibold">Error running health check:</h3>
        <p class="text-red-700">{error}</p>
      </div>
    {:else if healthCheck}
      <!-- Overall Status -->
      <div class="mb-6">
        <div class="flex items-center space-x-3 mb-2">
          <span class="text-2xl">{healthCheck.success ? '✅' : '❌'}</span>
          <h2 class="text-xl font-semibold {healthCheck.success ? 'text-green-700' : 'text-red-700'}">
            Overall Status: {healthCheck.success ? 'HEALTHY' : 'ISSUES DETECTED'}
          </h2>
        </div>
        <p class="text-gray-600">Check completed in {healthCheck.checks.totalTime}ms</p>
      </div>
      
      <!-- Individual Checks -->
      <div class="grid gap-4 mb-6">
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold text-gray-800 mb-2">
            {getStatusIcon(healthCheck.checks.environment)} Environment Configuration
          </h3>
          <p class="text-sm text-gray-600">
            Status: <span class="font-medium {healthCheck.checks.environment ? 'text-green-600' : 'text-red-600'}">
              {getStatusText(healthCheck.checks.environment)}
            </span>
          </p>
          <p class="text-sm text-gray-500 mt-1">
            Verifies that required environment variables are set
          </p>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold text-gray-800 mb-2">
            {getStatusIcon(healthCheck.checks.database)} Database Connection
          </h3>
          <p class="text-sm text-gray-600">
            Status: <span class="font-medium {healthCheck.checks.database ? 'text-green-600' : 'text-red-600'}">
              {getStatusText(healthCheck.checks.database)}
            </span>
          </p>
          <p class="text-sm text-gray-500 mt-1">
            Tests connection to Supabase database
          </p>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold text-gray-800 mb-2">
            {getStatusIcon(healthCheck.checks.auth)} Auth Service
          </h3>
          <p class="text-sm text-gray-600">
            Status: <span class="font-medium {healthCheck.checks.auth ? 'text-green-600' : 'text-red-600'}">
              {getStatusText(healthCheck.checks.auth)}
            </span>
          </p>
          <p class="text-sm text-gray-500 mt-1">
            Verifies Supabase auth service is accessible
          </p>
        </div>
      </div>
      
      <!-- Configuration Details -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="font-semibold text-gray-800 mb-3">Configuration Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-700">Environment:</span>
            <span class="text-gray-600 ml-2">{healthCheck.oauth.environment.nodeEnv}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Origin:</span>
            <span class="text-gray-600 ml-2">{healthCheck.oauth.environment.origin}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Supabase URL:</span>
            <span class="text-gray-600 ml-2">{healthCheck.oauth.environment.supabaseUrl}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Callback URL:</span>
            <span class="text-gray-600 ml-2">{healthCheck.oauth.callbackUrl}</span>
          </div>
        </div>
      </div>
      
      <!-- Issues -->
      {#if healthCheck.issues && healthCheck.issues.length > 0}
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 class="font-semibold text-red-800 mb-3">Issues Detected:</h3>
          <ul class="list-disc list-inside space-y-1">
            {#each healthCheck.issues as issue}
              <li class="text-red-700 text-sm">{issue}</li>
            {/each}
          </ul>
        </div>
      {/if}
      
      <!-- Recommendations -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-semibold text-blue-800 mb-3">Recommendations:</h3>
        <div class="space-y-1">
          {#each healthCheck.recommendations as rec}
            <p class="text-blue-700 text-sm">{rec}</p>
          {/each}
        </div>
      </div>
      
      <!-- Test Login -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <h3 class="font-semibold text-gray-800 mb-3">Test OAuth Login</h3>
        <p class="text-gray-600 mb-4 text-sm">
          If all checks pass, try testing the Google OAuth login:
        </p>
        <div class="space-x-4">
          <a href="/auth/login" 
             class="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            Go to Login Page
          </a>
          <a href="/auth/signup" 
             class="inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
            Go to Signup Page
          </a>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>