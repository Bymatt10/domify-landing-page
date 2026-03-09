import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			out: 'build',        // Carpeta que se copia en el Dockerfile (COPY /app/build)
			precompress: false,  // Evita problemas con archivos pre-comprimidos en el servidor
			envPrefix: ''        // No filtrar variables de entorno en runtime
		})
	}
};

export default config;
