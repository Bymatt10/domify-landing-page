import { redirect } from '@sveltejs/kit';

export function load({ url }) {
  console.log('Callback OAuth recibido...');

  // Si ya hay un hash o código en la URL, significa que el callback está siendo procesado
  const hasAuthParams = url.hash || url.searchParams.get('code');

  if (hasAuthParams) {
    console.log('Parámetros de autenticación detectados, permitiendo procesamiento...');

    // Si es un código (OAuth), dejar que se procese por la versión server del callback
    if (url.searchParams.get('code')) {
      return {};
    }

    // Si es un hash (magic link), dejar que Supabase lo procese en el cliente
    if (url.hash) {
      return {};
    }
  }

  // Si no hay parámetros, posiblemente es una carga directa de la página - redirigir
  console.log('No se detectaron parámetros de auth, redirigiendo...');
  throw redirect(302, '/');
}
