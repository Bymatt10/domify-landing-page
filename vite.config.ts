import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { config } from 'dotenv';

// Load environment variables from .env files
config();

export default defineConfig(({ mode }) => {
	// Load env file based on mode in the current working directory.
	const env = loadEnv(mode, process.cwd(), '');
	
	return {
	plugins: [sveltekit()],
	css: {
		postcss: './postcss.config.js',
	},
	envPrefix: ['PUBLIC_', 'VITE_', 'MAILER_', 'SMTP_', 'FROM_', 'SENDGRID_', 'PRIVATE_SUPABASE_'],
	define: {
		// Make environment variables available to the server with fallbacks
		'process.env.PUBLIC_SUPABASE_URL': JSON.stringify(env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || ''),
		'process.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || ''),
		'process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY || process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY || ''),
		'process.env.MAILER_SMTP_HOST': JSON.stringify(env.MAILER_SMTP_HOST || process.env.MAILER_SMTP_HOST || ''),
		'process.env.MAILER_SMTP_PORT': JSON.stringify(env.MAILER_SMTP_PORT || process.env.MAILER_SMTP_PORT || ''),
		'process.env.MAILER_SMTP_USER': JSON.stringify(env.MAILER_SMTP_USER || process.env.MAILER_SMTP_USER || ''),
		'process.env.MAILER_SMTP_PASS': JSON.stringify(env.MAILER_SMTP_PASS || process.env.MAILER_SMTP_PASS || ''),
		'process.env.SMTP_HOST': JSON.stringify(env.SMTP_HOST || process.env.SMTP_HOST || ''),
		'process.env.SMTP_PORT': JSON.stringify(env.SMTP_PORT || process.env.SMTP_PORT || ''),
		'process.env.SMTP_USER': JSON.stringify(env.SMTP_USER || process.env.SMTP_USER || ''),
		'process.env.SMTP_PASS': JSON.stringify(env.SMTP_PASS || process.env.SMTP_PASS || ''),
		'process.env.FROM_EMAIL': JSON.stringify(env.FROM_EMAIL || process.env.FROM_EMAIL || ''),
		'process.env.SENDGRID_API_KEY': JSON.stringify(env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY || ''),
	},
	server: {
		port: 5173,
		strictPort: false,
	},
	preview: {
		port: 4000,
		host: '0.0.0.0'
	},
	build: {
		// Ensure environment variables are available in production build
		rollupOptions: {
			external: []
		}
	},
	ssr: {
		// Don't externalize environment variables in SSR
		noExternal: ['dotenv']
	}
	};
});
