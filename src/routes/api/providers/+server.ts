import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '$lib/env-utils';
import {
    ExceptionHandler,
    ValidationException,
    AuthenticationException,
    AuthorizationException,
    validateRequired
} from '$lib/exceptions';

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();
const SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

// Helper to generate 10 providers per category
const generateMockProviders = () => {
    const providers = [];
    const categories = [
        { id: 1, name: 'Fontaneros' },
        { id: 2, name: 'Jardinería' },
        { id: 3, name: 'Electricistas' },
        { id: 4, name: 'Cerrajeros' },
        { id: 5, name: 'Carpintería' },
        { id: 6, name: 'Mudanzas' },
        { id: 7, name: 'Limpieza de Casas' },
        { id: 8, name: 'Ensamblaje' },
        { id: 9, name: 'Construcción' },
        { id: 10, name: 'Pintura' },
        { id: 11, name: 'Tecnología' },
        { id: 12, name: 'Seguridad' },
        { id: 13, name: 'Albañilería' }
    ];

    const firstNames = ['Juan', 'María', 'Pedro', 'Ana', 'Carlos', 'Elena', 'Luis', 'Sofía', 'Miguel', 'Lucía'];
    const lastNames = ['Pérez', 'García', 'López', 'Martínez', 'Rodríguez', 'Sánchez', 'González', 'Gómez', 'Díaz', 'Torres'];
    const locations = ['Managua', 'Granada', 'León', 'Masaya', 'Estelí', 'Matagalpa', 'Chinandega'];

    for (const cat of categories) {
        for (let i = 1; i <= 10; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const businessName = i % 3 === 0 ? `${firstName} ${lastName} Servicios` : `${firstName} ${lastName} - ${cat.name}`;
            const id = `${cat.id}-${i}`;

            providers.push({
                id,
                user_id: `user-${id}`,
                business_name: businessName,
                photo_url: `https://i.pravatar.cc/150?u=${id}`,
                average_rating: parseFloat((4 + Math.random()).toFixed(1)),
                hourly_rate: 300 + Math.floor(Math.random() * 500),
                bio: `Especialista en ${cat.name.toLowerCase()} con años de experiencia en el sector. Garantía de calidad y servicio profesional.`,
                total_reviews: Math.floor(Math.random() * 50),
                provider_type: i % 4 === 0 ? 'company' : 'individual',
                location: `${locations[Math.floor(Math.random() * locations.length)]}, Nicaragua`,
                phone: `+505 8${Math.floor(1000000 + Math.random() * 8000000)}`,
                is_active: true,
                category_ids: [cat.id]
            });
        }
    }
    return providers;
};

const mockProviders = generateMockProviders();

async function directSupabaseQuery(endpoint: string, options: any = {}) {
    const isPlaceholder = SUPABASE_URL && (SUPABASE_URL.includes('placeholder') || SUPABASE_URL.includes('fallback'));
    if (isPlaceholder) throw new Error('Supabase is in mock mode');

    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const apiKey = SERVICE_ROLE_KEY && SERVICE_ROLE_KEY !== 'fallback-service-role-key' ? SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'apikey': apiKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) throw new Error(`Supabase query failed: ${response.status}`);
    return response.json();
}

export const GET: RequestHandler = async ({ url }) => {
    try {
        const isPlaceholder = SUPABASE_URL && (SUPABASE_URL.includes('placeholder') || SUPABASE_URL.includes('fallback'));

        const id = url.searchParams.get('id');
        const categorySlug = url.searchParams.get('category');
        const categoryId = url.searchParams.get('category_id');

        // Normalize category mapping for mocks
        const slugMap: Record<string, number> = {
            'fontaneros': 1, 'jardineria': 2, 'electricistas': 3, 'cerrajeros': 4,
            'carpinteria': 5, 'mudanzas': 6, 'limpieza-casas': 7, 'ensamblaje': 8,
            'construccion': 9, 'pintura': 10, 'tecnologia': 11, 'seguridad': 12,
            'albañileria': 13
        };

        if (isPlaceholder) {
            let filtered = [...mockProviders];
            if (id) {
                filtered = filtered.filter(p => p.id === id);
            }

            let finalCatId = categoryId ? parseInt(categoryId) : null;
            if (categorySlug && !finalCatId) {
                finalCatId = slugMap[categorySlug] || null;
            }

            if (finalCatId) {
                filtered = filtered.filter(p => p.category_ids.includes(finalCatId));
            }

            const formatted = filtered.map(p => ({
                ...p,
                users: { id: p.user_id, email: 'mock@example.com', role: 'provider' },
                provider_categories: []
            }));

            return json({
                data: id ? formatted[0] : { providers: formatted, total: formatted.length },
                message: 'Providers retrieved (Mock)',
                statusCode: 200,
                timestamp: new Date().toISOString()
            });
        }

        try {
            const limit = parseInt(url.searchParams.get('limit') || '20');
            const offset = parseInt(url.searchParams.get('offset') || '0');

            let queryParams = [`is_active=eq.true`, `limit=${limit}`, `offset=${offset}`];
            const allProviders = await directSupabaseQuery(`provider_profiles?${queryParams.join('&')}`);

            return json({ data: { providers: allProviders, total: allProviders.length }, message: 'Providers retrieved', statusCode: 200, timestamp: new Date().toISOString() });
        } catch (innerError) {
            return json({
                data: { providers: mockProviders.slice(0, 10).map(p => ({ ...p, users: { id: p.user_id, email: 'mock@example.com', role: 'provider' } })), total: 10 },
                message: 'Providers retrieved (Mock Fallback)',
                statusCode: 200,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        return json({ error: { message: 'Unknown error', statusCode: 400, timestamp: new Date().toISOString() } }, { status: 400 });
    }
};

export const POST: RequestHandler = async () => json({ message: 'Mock POST success' }, { status: 201 });
export const PUT: RequestHandler = async () => json({ message: 'Mock PUT success' });
export const DELETE: RequestHandler = async () => json({ message: 'Mock DELETE success' });