/**
 * env-utils.ts
 *
 * Utilidades para leer variables de entorno de forma segura en TODOS los contextos:
 *   - Navegador (Vite / SvelteKit SSR con Vite)
 *   - Node.js en runtime (adapter-node)
 *   - Worker de análisis post-build de SvelteKit (analyse.js)
 *
 * REGLA: import.meta.env SIEMPRE dentro de try/catch porque no existe
 *        en el worker de análisis de SvelteKit y lanza ReferenceError.
 *        process.env se consulta PRIMERO porque funciona en todos los contextos Node.js.
 */

/** Lee import.meta.env de forma segura (nunca lanza). */
function safeMetaEnv(key: string): string | undefined {
	try {
		const val = (import.meta as any).env?.[key];
		return val || undefined;
	} catch {
		return undefined;
	}
}

/** Lee una variable de entorno: process.env → import.meta.env → fallback */
function getEnv(key: string, fallback: string): string {
	if (typeof process !== 'undefined' && process.env[key]) {
		return process.env[key] as string;
	}
	return safeMetaEnv(key) ?? fallback;
}

// ─── Supabase ────────────────────────────────────────────────────────────────

export function getSupabaseUrl(): string {
	return getEnv('PUBLIC_SUPABASE_URL', 'https://fallback.supabase.co');
}

export function getSupabaseAnonKey(): string {
	return getEnv('PUBLIC_SUPABASE_ANON_KEY', 'fallback-anon-key');
}

export function getSupabaseServiceRoleKey(): string {
	// Intentamos los tres nombres posibles que puede tener esta variable
	const value =
		(typeof process !== 'undefined' &&
			(process.env.SUPABASE_SERVICE_ROLE_KEY ||
				process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY ||
				process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY)) ||
		safeMetaEnv('SUPABASE_SERVICE_ROLE_KEY') ||
		safeMetaEnv('PRIVATE_SUPABASE_SERVICE_ROLE_KEY') ||
		safeMetaEnv('PUBLIC_SUPABASE_SERVICE_ROLE_KEY');

	if (!value) {
		console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY no encontrado. Usando valor de fallback.');
		return 'fallback-service-role-key';
	}
	return value;
}

// ─── Site URL ────────────────────────────────────────────────────────────────

export function getSiteUrl(): string {
	return getEnv('PUBLIC_SITE_URL', 'http://localhost:3000');
}

// ─── SMTP ────────────────────────────────────────────────────────────────────

export function getSmtpHost(): string {
	return getEnv('SMTP_HOST', 'localhost');
}

export function getSmtpPort(): string {
	return getEnv('SMTP_PORT', '587');
}

export function getSmtpUser(): string {
	return getEnv('SMTP_USER', 'fallback-user');
}

export function getSmtpPass(): string {
	return getEnv('SMTP_PASS', 'fallback-password');
}

export function getFromEmail(): string {
	return getEnv('FROM_EMAIL', 'noreply@domify.app');
}

// ─── Otros ───────────────────────────────────────────────────────────────────

export function getGoogleSheetsCredentials(): string | null {
	const value =
		(typeof process !== 'undefined' && process.env.GOOGLE_SHEETS_CREDENTIALS) ||
		safeMetaEnv('GOOGLE_SHEETS_CREDENTIALS');
	return value || null;
}

export function getAdminEmail(): string {
	return getEnv('ADMIN_EMAIL', 'admin@domify.app');
}

// ─── Validación y configuración del servidor ─────────────────────────────────

export function validateEnvironment(): { valid: boolean; missing: string[] } {
	const requiredVars = [
		'PUBLIC_SUPABASE_URL',
		'PUBLIC_SUPABASE_ANON_KEY',
		'PRIVATE_SUPABASE_SERVICE_ROLE_KEY'
	];

	const missing: string[] = [];

	for (const varName of requiredVars) {
		if (!process.env[varName]) {
			missing.push(varName);
		}
	}

	return {
		valid: missing.length === 0,
		missing
	};
}

export function getServerConfig() {
	return {
		port: process.env.PORT || '3000',
		host: process.env.HOST || '0.0.0.0',
		nodeEnv: process.env.NODE_ENV || 'development',
		isProduction: process.env.NODE_ENV === 'production'
	};
}