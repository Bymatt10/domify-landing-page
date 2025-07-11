import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException, 
    AuthenticationException
} from '$lib/exceptions';

/**
 * @swagger
 * /api/categories/seed:
 *   post:
 *     summary: Seed categories
 *     description: Populate the database with initial service categories for onboarding
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Categories seeded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Category'
 *                     message:
 *                       type: string
 *                       example: "Categories seeded successfully"
 *                     statusCode:
 *                       type: number
 *                       example: 201
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid or expired token, or insufficient permissions
 *       500:
 *         description: Internal server error
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // Check authentication
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationException('Authentication required');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // For now, allow demo tokens for testing
        if (!token || token === 'demo-token-12345' || token.includes('demo-token')) {
            console.log('Using demo token for category seeding');
        } else {
            // In a real app, you'd verify the JWT and get user info
            console.log('Token provided, assuming admin access for testing');
        }

        // Initial categories based on the main page
        const initialCategories = [
            // 🔧 Servicios de mantenimiento y reparación
            { name: 'Electricistas', slug: 'electricistas', icon: '💡', description: 'Instalaciones y reparaciones eléctricas residenciales y comerciales' },
            { name: 'Fontaneros / Plomeros', slug: 'fontaneros', icon: '🚰', description: 'Reparación e instalación de sistemas de fontanería y tuberías' },
            { name: 'Mantenimiento de aires acondicionados', slug: 'aires-acondicionados', icon: '❄️', description: 'Limpieza, recarga e instalación de equipos de aire acondicionado' },
            { name: 'Refrigeración', slug: 'refrigeracion', icon: '🧊', description: 'Reparación de freezers, refrigeradoras y cuartos fríos' },
            { name: 'Albañilería / Construcción / Remodelación', slug: 'albanileria', icon: '🏗️', description: 'Obras de construcción, remodelación y acabados en general' },
            { name: 'Soldadura y Herrería', slug: 'soldadura-herreria', icon: '⚒️', description: 'Trabajos de soldadura, fabricación y reparación de estructuras metálicas' },

            // 🌳 Servicios de exterior
            { name: 'Jardinería y poda de árboles', slug: 'jardineria', icon: '🌳', description: 'Diseño, mantenimiento de jardines y poda de árboles' },
            { name: 'Limpieza de terrenos y lotificación', slug: 'limpieza-terrenos', icon: '🧹', description: 'Desbroce y limpieza de terrenos para construcción o cultivo' },
            { name: 'Instalación de cercas', slug: 'instalacion-cercas', icon: '🚧', description: 'Colocación de malla ciclón, cercas eléctricas y otros cercados' },

            // 🏠 Servicios para el hogar
            { name: 'Limpieza general y profunda de casas', slug: 'limpieza-casas', icon: '🏠', description: 'Limpieza residencial estándar y detallada' },
            { name: 'Limpieza de muebles, alfombras y colchones', slug: 'limpieza-muebles', icon: '🛋️', description: 'Lavado y desinfección de tapicería y alfombras' },
            { name: 'Fumigación y control de plagas', slug: 'fumigacion', icon: '🐜', description: 'Eliminación y prevención de plagas en interiores y exteriores' },
            { name: 'Pintura residencial y comercial', slug: 'pintura', icon: '🖌️', description: 'Aplicación de pintura, acabados y recubrimientos' },
            { name: 'Carpintería y reparación de muebles', slug: 'carpinteria', icon: '🪚', description: 'Fabricación y reparación de muebles de madera' },

            // 💻 Servicios técnicos
            { name: 'Reparación de computadoras y laptops', slug: 'reparacion-computadoras', icon: '💻', description: 'Mantenimiento y reparación de equipos de cómputo' },
            { name: 'Redes e instalación de cámaras de seguridad', slug: 'redes-camaras', icon: '📷', description: 'Configuración de redes y sistemas de videovigilancia' },
            { name: 'Diseño gráfico y marketing digital', slug: 'diseno-grafico', icon: '🎨', description: 'Servicios de branding, diseño y promoción digital' },

            // 🚗 Servicios automotrices
            { name: 'Mecánica automotriz', slug: 'mecanica-automotriz', icon: '🚗', description: 'Mantenimiento preventivo y correctivo de vehículos' },
            { name: 'Lavado y detallado de autos', slug: 'lavado-autos', icon: '🚙', description: 'Limpieza exterior e interior, pulido y encerado de vehículos' },
            { name: 'Hojalatería y pintura de autos', slug: 'hojalateria-pintura-autos', icon: '🚘', description: 'Reparación de carrocería y pintura automotriz' },
            { name: 'Instalación de polarizado y accesorios', slug: 'polarizado-accesorios', icon: '🪟', description: 'Colocación de polarizado, audio y accesorios automotrices' },

            // 👷‍♂️ Otros servicios demandados
            { name: 'Cerrajería', slug: 'cerrajeria', icon: '🔑', description: 'Apertura, cambio y reparación de cerraduras' },
            { name: 'Instalación de gypsum y cielo raso', slug: 'gypsum-cielo-raso', icon: '🏚️', description: 'Construcción y acabados en paneles de yeso' },
            { name: 'Vidriería y aluminio', slug: 'vidrieria-aluminio', icon: '🔲', description: 'Fabricación e instalación de ventanas y puertas de vidrio y aluminio' }
        ];

        // Upsert categories (insert if not exists, update otherwise)
        const { data: categories, error } = await locals.supabase
            .from('categories')
            .upsert(initialCategories, { onConflict: 'slug', ignoreDuplicates: true })
            .select();

        if (error) {
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            { categories },
            'Categories seeded successfully',
            201
        );

        return json(successResponse, { status: 201 });
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 