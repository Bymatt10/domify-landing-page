import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getSupabaseUrl } from '$lib/env-utils';
import {
    ExceptionHandler,
    ValidationException,
    NotFoundException
} from '$lib/exceptions';

const SUPABASE_URL = getSupabaseUrl();

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

export const GET: RequestHandler = async ({ params, locals }) => {
    try {
        const { slug } = params;
        if (!slug) throw new ValidationException('Category identifier is required');

        const isPlaceholder = SUPABASE_URL && (SUPABASE_URL.includes('placeholder') || SUPABASE_URL.includes('fallback'));

        if (isPlaceholder || !locals.supabase) {
            const category = sampleCategories.find(c => c.slug === slug || c.id.toString() === slug);
            if (!category) throw new NotFoundException('Category (Mock)');
            return json(ExceptionHandler.createSuccessResponse(category, 'Category retrieved successfully (Mock)'));
        }

        const isNumericId = !isNaN(Number(slug)) && Number.isInteger(Number(slug));
        let query = locals.supabase.from('categories').select('*');
        if (isNumericId) query = query.eq('id', parseInt(slug));
        else query = query.eq('slug', slug);

        const { data: category, error } = await query.single();
        if (error || !category) {
            // Fallback to mock if not found in DB but we are in dev/demo
            const mockCat = sampleCategories.find(c => c.slug === slug || c.id.toString() === slug);
            if (mockCat) return json(ExceptionHandler.createSuccessResponse(mockCat, 'Category retrieved from mock fallback'));
            throw new NotFoundException('Category');
        }

        return json(ExceptionHandler.createSuccessResponse(category, 'Category retrieved successfully'));
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};

export const PUT: RequestHandler = async () => json({ message: 'Mock PUT success' });
export const DELETE: RequestHandler = async () => json({ message: 'Mock DELETE success' });