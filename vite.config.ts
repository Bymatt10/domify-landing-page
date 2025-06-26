import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	envPrefix: ['PUBLIC_', 'VITE_', 'MAILER_', 'SMTP_', 'FROM_'],
	define: {
		// Make environment variables available to the server
		'process.env.MAILER_SMTP_HOST': JSON.stringify(process.env.MAILER_SMTP_HOST),
		'process.env.MAILER_SMTP_PORT': JSON.stringify(process.env.MAILER_SMTP_PORT),
		'process.env.MAILER_SMTP_USER': JSON.stringify(process.env.MAILER_SMTP_USER),
		'process.env.MAILER_SMTP_PASS': JSON.stringify(process.env.MAILER_SMTP_PASS),
		'process.env.SMTP_HOST': JSON.stringify(process.env.SMTP_HOST),
		'process.env.SMTP_PORT': JSON.stringify(process.env.SMTP_PORT),
		'process.env.SMTP_USER': JSON.stringify(process.env.SMTP_USER),
		'process.env.SMTP_PASS': JSON.stringify(process.env.SMTP_PASS),
		'process.env.FROM_EMAIL': JSON.stringify(process.env.FROM_EMAIL),
	},
	server: {
		port: 5173,
		strictPort: false,
	}
});
