import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		postcss: './postcss.config.js',
	},
	envPrefix: ['PUBLIC_', 'VITE_', 'MAILER_', 'SMTP_', 'FROM_', 'SENDGRID_'],
	define: {
		// Make environment variables available to the server with fallbacks
		'process.env.MAILER_SMTP_HOST': JSON.stringify(process.env.MAILER_SMTP_HOST || ''),
		'process.env.MAILER_SMTP_PORT': JSON.stringify(process.env.MAILER_SMTP_PORT || ''),
		'process.env.MAILER_SMTP_USER': JSON.stringify(process.env.MAILER_SMTP_USER || ''),
		'process.env.MAILER_SMTP_PASS': JSON.stringify(process.env.MAILER_SMTP_PASS || ''),
		'process.env.SMTP_HOST': JSON.stringify(process.env.SMTP_HOST || ''),
		'process.env.SMTP_PORT': JSON.stringify(process.env.SMTP_PORT || ''),
		'process.env.SMTP_USER': JSON.stringify(process.env.SMTP_USER || ''),
		'process.env.SMTP_PASS': JSON.stringify(process.env.SMTP_PASS || ''),
		'process.env.FROM_EMAIL': JSON.stringify(process.env.FROM_EMAIL || ''),
		'process.env.SENDGRID_API_KEY': JSON.stringify(process.env.SENDGRID_API_KEY || ''),
	},
	server: {
		port: 5173,
		strictPort: false,
	},
	preview: {
		port: 4000,
		host: '0.0.0.0'
	}
});
