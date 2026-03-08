import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl } from '$lib/env-utils';
import {
    ExceptionHandler,
    ValidationException,
    AuthenticationException,
    AuthorizationException,
    validateRequired
} from '$lib/exceptions';

const SUPABASE_URL = getSupabaseUrl();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 */
export const GET: RequestHandler = async ({ url, locals }) => {
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const returnSampleCategories = () => {
        const sampleCategories = [
            { id: 1, name: 'Fontaneros / Plomeros', description: 'Reparación e instalación de sistemas de agua', icon: '🚰', slug: 'fontaneros', created_at: new Date().toISOString() },
            { id: 2, name: 'Jardinería', description: 'Cuidado y diseño de áreas verdes', icon: '🌳', slug: 'jardineria', created_at: new Date().toISOString() },
            { id: 3, name: 'Electricistas', description: 'Instalaciones y reparaciones eléctricas profesionales', icon: '⚡', slug: 'electricistas', created_at: new Date().toISOString() },
            { id: 4, name: 'Cerrajeros', description: 'Servicios de cerrajería y seguridad', icon: '🔑', slug: 'cerrajeros', created_at: new Date().toISOString() },
            { id: 5, name: 'Carpintería', description: 'Trabajos de carpintería y ebanistería', icon: '🪚', slug: 'carpinteria', created_at: new Date().toISOString() },
            { id: 6, name: 'Mudanzas', description: 'Servicios de mudanza y traslado', icon: '🚚', slug: 'mudanzas', created_at: new Date().toISOString() },
            { id: 7, name: 'Limpieza de Casas', description: 'Limpieza general y profunda del hogar', icon: '🏠', slug: 'limpieza-casas', created_at: new Date().toISOString() },
            { id: 8, name: 'Ensamblaje de Muebles', description: 'Montaje y ensamblaje profesional de muebles', icon: '🔧', slug: 'ensamblaje', created_at: new Date().toISOString() },
            { id: 9, name: 'Construcción', description: 'Servicios de construcción y remodelación', icon: '🏗️', slug: 'construccion', created_at: new Date().toISOString() },
            { id: 10, name: 'Pintura', description: 'Servicios de pintura interior y exterior', icon: '🎨', slug: 'pintura', created_at: new Date().toISOString() },
            { id: 11, name: 'Tecnología', description: 'Servicios de tecnología y computación', icon: '💻', slug: 'tecnologia', created_at: new Date().toISOString() },
            { id: 12, name: 'Seguridad', description: 'Sistemas de seguridad y vigilancia', icon: '🔒', slug: 'seguridad', created_at: new Date().toISOString() },
            { id: 13, name: 'Albañilería', description: 'Trabajos de albañilería y mampostería', icon: '🧱', slug: 'albañileria', created_at: new Date().toISOString() }
        ];
        return json(ExceptionHandler.createSuccessResponse({ categories: sampleCategories, total: sampleCategories.length }, 'Sample categories retrieved successfully'));
    };

    // Check if we are using placeholder credentials
    const isPlaceholder = SUPABASE_URL && (SUPABASE_URL.includes('placeholder') || SUPABASE_URL.includes('fallback'));

    if (isPlaceholder || !locals.supabase) {
        return returnSampleCategories();
    }

    try {
        const { data: categories, error, count } = await locals.supabase
            .from('categories')
            .select('*')
            .range(offset, offset + limit - 1);

        if (error || !categories || categories.length === 0) {
            return returnSampleCategories();
        }

        // Sorting logic
        const priorityCategories = [
            'fontaneros', 'plomeros', 'plomeria', 'jardineria', 'jardinería',
            'electricistas', 'electricidad', 'cerrajeros', 'cerrajería',
            'carpinteria', 'carpintería', 'mudanzas', 'mudanza'
        ];

        categories.sort((a: any, b: any) => {
            const aName = a.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const bName = b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const aSlug = a.slug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const bSlug = b.slug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const aPriority = priorityCategories.find(priority => aName.includes(priority) || aSlug.includes(priority));
            const bPriority = priorityCategories.find(priority => bName.includes(priority) || bSlug.includes(priority));

            if (aPriority && bPriority) return priorityCategories.indexOf(aPriority) - priorityCategories.indexOf(bPriority);
            if (aPriority && !bPriority) return -1;
            if (!aPriority && bPriority) return 1;
            return aName.localeCompare(bName);
        });

        return json(ExceptionHandler.createSuccessResponse({ categories, total: count || categories.length }, 'Categories retrieved successfully'));
    } catch (e) {
        return returnSampleCategories();
    }
};

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const body = await request.json();
        validateRequired(body.name, 'Name');
        // validación removida temporalmente ya que icon podría no ser proveido por todos los clientes
        // validateRequired(body.icon, 'Icon');

        const name = body.name;
        const icon = body.icon || ' Briefcase'; // Default icon
        const description = body.description || `Proveedores de ${name}`;
        
        // Generar slug a partir del nombre
        const safeSlug = name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with dashes
            .replace(/^-+|-+$/g, ''); // trim dashes

        const slug = body.slug || safeSlug || 'cat-' + Date.now();

        // If placeholder, just return success
        const isPlaceholder = SUPABASE_URL && (SUPABASE_URL.includes('placeholder') || SUPABASE_URL.includes('fallback'));
        if (isPlaceholder || !locals.supabase) {
            return json(ExceptionHandler.createSuccessResponse({ id: Math.floor(Math.random() * 1000), name, slug, icon, description }, 'Category created successfully (Mock)', 201), { status: 201 });
        }

        const { data, error } = await locals.supabase
            .from('categories')
            .insert([{ name, slug, description, icon }])
            .select()
            .single();

        if (error) {
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        return json(ExceptionHandler.createSuccessResponse(data, 'Category created successfully', 201), { status: 201 });
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};
