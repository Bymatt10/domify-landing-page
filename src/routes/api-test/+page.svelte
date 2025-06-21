<script lang="ts">
	
	import { onMount } from 'svelte';

	let healthStatus = 'Loading...';
	let usersStatus = 'Not tested';
	let servicesStatus = 'Not tested';
	let categoriesStatus = 'Not tested';
	let swaggerStatus = 'Not tested';
	let testResults: Array<{
		endpoint: string;
		method: string;
		status: number | string;
		success: boolean;
		data?: any;
		error?: string;
	}> = [];

	async function testHealth() {
		try {
			const response = await fetch('/api/health');
			const data = await response.json();
			healthStatus = `✅ Success: ${data.message}`;
		} catch (error) {
			healthStatus = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	}

	async function testUsers() {
		try {
			const response = await fetch('/api/users');
			if (response.ok) {
				const data = await response.json();
				usersStatus = `✅ Success: Found ${data.users?.length || 0} users`;
			} else {
				usersStatus = `❌ Error: ${response.status} ${response.statusText}`;
			}
		} catch (error) {
			usersStatus = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	}

	async function testServices() {
		try {
			const response = await fetch('/api/services');
			if (response.ok) {
				const data = await response.json();
				servicesStatus = `✅ Success: Found ${data.services?.length || 0} services`;
			} else {
				servicesStatus = `❌ Error: ${response.status} ${response.statusText}`;
			}
		} catch (error) {
			servicesStatus = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	}

	async function testCategories() {
		try {
			const response = await fetch('/api/categories');
			if (response.ok) {
				const data = await response.json();
				categoriesStatus = `✅ Success: Found ${data.data?.categories?.length || 0} categories`;
			} else {
				categoriesStatus = `❌ Error: ${response.status} ${response.statusText}`;
			}
		} catch (error) {
			categoriesStatus = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	}

	async function testSwagger() {
		try {
			const response = await fetch('/api/swagger.json');
			if (response.ok) {
				const data = await response.json();
				swaggerStatus = `✅ Success: API has ${Object.keys(data.paths).length} endpoints`;
			} else {
				swaggerStatus = `❌ Error: ${response.status} ${response.statusText}`;
			}
		} catch (error) {
			swaggerStatus = `❌ Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	}

	async function testEndpoint(endpoint: string, method: string = 'GET', body: any = null) {
		try {
			const options: RequestInit = {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer demo-token-12345'
				}
			};

			if (body) {
				options.body = JSON.stringify(body);
			}

			const response = await fetch(endpoint, options);
			const data = await response.json();

			return {
				endpoint,
				method,
				status: response.status,
				success: response.ok,
				data
			};
		} catch (error: any) {
			return {
				endpoint,
				method,
				status: 'ERROR',
				success: false,
				error: error.message
			};
		}
	}

	async function runTests() {
		testResults = [];
		
		// Test 1: Get all users (now customers)
		testResults.push(await testEndpoint('/api/users'));
		
		// Test 2: Create a new user
		testResults.push(await testEndpoint('/api/users', 'POST', {
			email: 'test@example.com',
			password: 'password123',
			first_name: 'Test',
			last_name: 'User',
			role: 'customer'
		}));

		// Test 3: Get categories
		testResults.push(await testEndpoint('/api/categories'));

		// Test 4: Get current user profile
		testResults.push(await testEndpoint('/api/me'));

		// Test 5: Debug endpoint
		testResults.push(await testEndpoint('/api/debug'));

		// Test 6: Check status
		testResults.push(await testEndpoint('/api/debug/check-status'));

		testResults = testResults;
	}

	onMount(() => {
		testHealth();
		testCategories();
	});
</script>

<svelte:head>
	<title>API Test - Domify</title>
</svelte:head>

<div class="test-container">
	<div class="test-header">
		<h1>Domify API Test</h1>
		<p>Testing API endpoints and Swagger documentation</p>
	</div>

	<div class="test-grid">
		<div class="test-card">
			<h3>Health Check</h3>
			<p class="status">{healthStatus}</p>
			<button on:click={testHealth} class="btn-test">Test Again</button>
		</div>

		<div class="test-card">
			<h3>Users API</h3>
			<p class="status">{usersStatus}</p>
			<button on:click={testUsers} class="btn-test">Test Users</button>
		</div>

		<div class="test-card">
			<h3>Services API</h3>
			<p class="status">{servicesStatus}</p>
			<button on:click={testServices} class="btn-test">Test Services</button>
		</div>

		<div class="test-card">
			<h3>Categories API</h3>
			<p class="status">{categoriesStatus}</p>
			<button on:click={testCategories} class="btn-test">Test Categories</button>
		</div>

		<div class="test-card">
			<h3>Swagger JSON</h3>
			<p class="status">{swaggerStatus}</p>
			<button on:click={testSwagger} class="btn-test">Test Swagger</button>
		</div>

		<div class="test-card full-width">
			<h3>🔬 Automated API Tests</h3>
			<button on:click={runTests} class="btn-test">Run All Tests</button>
			
			{#if testResults.length > 0}
				<div class="test-results">
					{#each testResults as result}
						<div class="test-result" class:success={result.success} class:error={!result.success}>
							<div class="result-header">
								<span class="method">{result.method}</span>
								<span class="endpoint">{result.endpoint}</span>
								<span class="status-code" class:success={result.success} class:error={!result.success}>
									{result.status}
								</span>
							</div>
							{#if result.error}
								<div class="error-details">{result.error}</div>
							{:else if result.data}
								<details class="response-details">
									<summary>Response Data</summary>
									<pre>{JSON.stringify(result.data, null, 2)}</pre>
								</details>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="links-section">
		<h2>Quick Links</h2>
		<div class="links-grid">
			<a href="/api/docs" class="link-card">
				<h3>📚 Swagger UI</h3>
				<p>Interactive API documentation</p>
			</a>
			<a href="/api/swagger.json" class="link-card">
				<h3>📄 OpenAPI JSON</h3>
				<p>Raw API specification</p>
			</a>
			<a href="/api/health" class="link-card">
				<h3>💚 Health Check</h3>
				<p>API status endpoint</p>
			</a>
		</div>
	</div>
</div>

<style>
	.test-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.test-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.test-header h1 {
		color: var(--color-text);
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.test-header p {
		color: var(--color-text-light);
		font-size: 1.1rem;
	}

	.test-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.test-card {
		background: var(--color-background-white);
		padding: 2rem;
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-md);
		border: 1px solid #e1e5e9;
	}

	.test-card.full-width {
		grid-column: 1 / -1;
	}

	.test-card h3 {
		color: var(--color-text);
		margin-bottom: 1rem;
		font-size: 1.3rem;
	}

	.status {
		margin-bottom: 1rem;
		padding: 0.75rem;
		border-radius: var(--border-radius-sm);
		background: #f8f9fa;
		border-left: 4px solid var(--color-primary);
		font-family: monospace;
		font-size: 0.9rem;
	}

	.btn-test {
		background: var(--color-primary);
		color: var(--color-text-white);
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: var(--border-radius-sm);
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.btn-test:hover {
		background: var(--color-primary-hover);
	}

	.links-section {
		margin-top: 3rem;
	}

	.links-section h2 {
		text-align: center;
		color: var(--color-text);
		margin-bottom: 2rem;
		font-size: 2rem;
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.link-card {
		background: var(--color-background-white);
		padding: 2rem;
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-md);
		border: 1px solid #e1e5e9;
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.link-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.link-card h3 {
		color: var(--color-primary);
		margin-bottom: 0.5rem;
		font-size: 1.2rem;
	}

	.link-card p {
		color: var(--color-text-light);
		margin: 0;
		font-size: 0.9rem;
	}

	@media (max-width: 768px) {
		.test-grid {
			grid-template-columns: 1fr;
		}

		.links-grid {
			grid-template-columns: 1fr;
		}

		.test-header h1 {
			font-size: 2rem;
		}
	}

	.test-results {
		margin-top: 1rem;
		max-height: 400px;
		overflow-y: auto;
		border: 1px solid #e1e5e9;
		border-radius: var(--border-radius-sm);
	}

	.test-result {
		padding: 1rem;
		border-bottom: 1px solid #e1e5e9;
		background: #f8f9fa;
	}

	.test-result:last-child {
		border-bottom: none;
	}

	.test-result.success {
		border-left: 4px solid #28a745;
	}

	.test-result.error {
		border-left: 4px solid #dc3545;
	}

	.result-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.method {
		background: var(--color-primary);
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: bold;
		min-width: 60px;
		text-align: center;
	}

	.endpoint {
		flex: 1;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.status-code {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-weight: bold;
		font-size: 0.8rem;
	}

	.status-code.success {
		background: #d4edda;
		color: #155724;
	}

	.status-code.error {
		background: #f8d7da;
		color: #721c24;
	}

	.error-details {
		color: #dc3545;
		font-size: 0.9rem;
		font-family: monospace;
		background: #f8d7da;
		padding: 0.5rem;
		border-radius: 4px;
		margin-top: 0.5rem;
	}

	.response-details {
		margin-top: 0.5rem;
	}

	.response-details summary {
		cursor: pointer;
		font-weight: bold;
		color: var(--color-primary);
	}

	.response-details pre {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.8rem;
		margin-top: 0.5rem;
		border: 1px solid #e1e5e9;
	}
</style> 