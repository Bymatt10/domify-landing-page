import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
  try {
    // Obtener todos los proveedores activos
    const { data: providers, error } = await supabase
      .from('provider_profiles')
      .select('id, business_name, updated_at')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching providers for sitemap:', error);
    }

    const baseUrl = 'https://domify.app';
    const currentDate = new Date().toISOString();

    // Páginas estáticas principales
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/services', priority: '0.9', changefreq: 'weekly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
      { url: '/auth/login', priority: '0.5', changefreq: 'monthly' },
      { url: '/auth/signup', priority: '0.5', changefreq: 'monthly' },
      { url: '/become-provider', priority: '0.8', changefreq: 'weekly' }
    ];

    // Páginas de categorías de servicios
    const serviceCategories = [
      { url: '/services/ensamblaje', priority: '0.8', changefreq: 'weekly' },
      { url: '/services/limpieza', priority: '0.8', changefreq: 'weekly' },
      { url: '/services/jardineria', priority: '0.8', changefreq: 'weekly' },
      { url: '/services/montaje', priority: '0.8', changefreq: 'weekly' },
      { url: '/services/mudanza', priority: '0.8', changefreq: 'weekly' }
    ];

    // Generar XML del sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Agregar páginas estáticas
    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Agregar páginas de categorías
    serviceCategories.forEach(category => {
      sitemap += `  <url>
    <loc>${baseUrl}${category.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${category.changefreq}</changefreq>
    <priority>${category.priority}</priority>
  </url>
`;
    });

    // Agregar páginas de proveedores
    if (providers && providers.length > 0) {
      providers.forEach(provider => {
        const lastmod = provider.updated_at || currentDate;
        sitemap += `  <url>
    <loc>${baseUrl}/provider/${provider.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      });
    }

    sitemap += `</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
      }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}; 