<script lang="ts">
	
	import { onMount } from 'svelte';

	let healthStatus = 'Loading...';
	let usersStatus = 'Not tested';
	let servicesStatus = 'Not tested';
	let categoriesStatus = 'Not tested';
	let swaggerStatus = 'Not tested';

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
		color: #333;
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.test-header p {
		color: #666;
		font-size: 1.1rem;
	}

	.test-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.test-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid #e1e5e9;
	}

	.test-card h3 {
		color: #333;
		margin-bottom: 1rem;
		font-size: 1.3rem;
	}

	.status {
		margin-bottom: 1rem;
		padding: 0.75rem;
		border-radius: 6px;
		background: #f8f9fa;
		border-left: 4px solid #667eea;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.btn-test {
		background: #667eea;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.btn-test:hover {
		background: #5a6fd8;
	}

	.links-section {
		margin-top: 3rem;
	}

	.links-section h2 {
		text-align: center;
		color: #333;
		margin-bottom: 2rem;
		font-size: 2rem;
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.link-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border: 1px solid #e1e5e9;
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.link-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
	}

	.link-card h3 {
		color: #667eea;
		margin-bottom: 0.5rem;
		font-size: 1.2rem;
	}

	.link-card p {
		color: #666;
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
</style> 