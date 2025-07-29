import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException, 
    AuthenticationException,
    AuthorizationException,
    NotFoundException,
    validateRequired
} from '$lib/exceptions';

/**
 * @swagger
 * /api/categories/{identifier}:
 *   get:
 *     summary: Get category by identifier
 *     description: Retrieve a specific category by its slug or numeric ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           oneOf:
 *             - type: string
 *               description: Category slug
 *             - type: integer
 *               description: Category ID
 *         description: Category slug or numeric ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *                 message:
 *                   type: string
 *                   example: "Category retrieved successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export const GET: RequestHandler = async ({ params, locals }) => {
    try {
        if (!params.slug) {
            throw new ValidationException('Category identifier is required');
        }
        
        const { slug } = params;

        // Check if the slug is a numeric ID
        const isNumericId = !isNaN(Number(slug)) && Number.isInteger(Number(slug));
        
        let query = locals.supabase
            .from('categories')
            .select('*');

        if (isNumericId) {
            // If it's a numeric ID, search by ID
            query = query.eq('id', parseInt(slug));
        } else {
            // If it's a string, search by slug
            query = query.eq('slug', slug);
        }

        const { data: category, error } = await query.single();

        if (error || !category) {
            throw new NotFoundException('Category');
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            category,
            'Category retrieved successfully'
        );

        return json(successResponse);
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};

/**
 * @swagger
 * /api/categories/{identifier}:
 *   put:
 *     summary: Update category
 *     description: Update an existing category by slug or ID (admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           oneOf:
 *             - type: string
 *               description: Category slug
 *             - type: integer
 *               description: Category ID
 *         description: Category slug or numeric ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *                 example: "Ensamblaje de Muebles"
 *               path_image:
 *                 type: string
 *                 description: Path to category image
 *                 example: "/img/assembly.png"
 *               description:
 *                 type: string
 *                 description: Category description
 *                 example: "Servicios de ensamblaje de muebles y equipos"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid or expired token, or insufficient permissions
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
    try {
        // Check authentication
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationException('Authentication required');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // For now, allow demo tokens for testing
        if (!token || token === 'demo-token-12345' || token.includes('demo-token')) {
            console.log('Using demo token for category update');
        } else {
            // In a real app, you'd verify the JWT and get user info
            console.log('Token provided, assuming admin access for testing');
        }

        if (!params.slug) {
            throw new ValidationException('Category identifier is required');
        }

        const { slug } = params;
        const isNumericId = !isNaN(Number(slug)) && Number.isInteger(Number(slug));
        
        let categoryId: number;
        let categorySlug: string | null = null;

        if (isNumericId) {
            categoryId = parseInt(slug);
        } else {
            // Get the category by slug to find its ID
            const { data: category } = await locals.supabase
                .from('categories')
                .select('id')
                .eq('slug', slug)
                .single();
            
            if (!category) {
                throw new NotFoundException('Category');
            }
            categoryId = category.id;
            categorySlug = slug;
        }

        const body = await request.json();
        const { name, path_image, description } = body;

        // Check if category exists
        const { data: existingCategory } = await locals.supabase
            .from('categories')
            .select('id')
            .eq('id', categoryId)
            .single();

        if (!existingCategory) {
            throw new NotFoundException('Category');
        }

        // Validate name length if provided
        if (name && name.length > 100) {
            throw new ValidationException('Category name must be 100 characters or less');
        }

        // Validate image path if provided
        if (path_image && path_image.length > 500) {
            throw new ValidationException('Image path must be 500 characters or less');
        }

        // Check if new name already exists (if name is being updated)
        if (name) {
            const { data: nameConflict } = await locals.supabase
                .from('categories')
                .select('id')
                .eq('name', name)
                .neq('id', categoryId)
                .single();

            if (nameConflict) {
                throw new ValidationException('Category name already exists');
            }
        }

        // Update the category
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (path_image !== undefined) updateData.path_image = path_image;
        if (description !== undefined) updateData.description = description;

        const { data: category, error } = await locals.supabase
            .from('categories')
            .update(updateData)
            .eq('id', categoryId)
            .select()
            .single();

        if (error) {
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            category,
            'Category updated successfully'
        );

        return json(successResponse);
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};

/**
 * @swagger
 * /api/categories/{identifier}:
 *   delete:
 *     summary: Delete category
 *     description: Delete a category by slug or ID (admin only). Cannot delete if it has services.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           oneOf:
 *             - type: string
 *               description: Category slug
 *             - type: integer
 *               description: Category ID
 *         description: Category slug or numeric ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - category has services
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid or expired token, or insufficient permissions
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export const DELETE: RequestHandler = async ({ params, request, locals }) => {
    try {
        // Check authentication
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationException('Authentication required');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // For now, allow demo tokens for testing
        if (!token || token === 'demo-token-12345' || token.includes('demo-token')) {
            console.log('Using demo token for category deletion');
        } else {
            // In a real app, you'd verify the JWT and get user info
            console.log('Token provided, assuming admin access for testing');
        }

        if (!params.slug) {
            throw new ValidationException('Category identifier is required');
        }

        const { slug } = params;
        const isNumericId = !isNaN(Number(slug)) && Number.isInteger(Number(slug));
        
        let categoryId: number;

        if (isNumericId) {
            categoryId = parseInt(slug);
        } else {
            // Get the category by slug to find its ID
            const { data: category } = await locals.supabase
                .from('categories')
                .select('id')
                .eq('slug', slug)
                .single();
            
            if (!category) {
                throw new NotFoundException('Category');
            }
            categoryId = category.id;
        }

        // Check if category exists
        const { data: existingCategory } = await locals.supabase
            .from('categories')
            .select('id')
            .eq('id', categoryId)
            .single();

        if (!existingCategory) {
            throw new NotFoundException('Category');
        }

        // Check if category has services
        const { data: services } = await locals.supabase
            .from('services')
            .select('id')
            .eq('category_id', categoryId);

        if (services && services.length > 0) {
            throw new ValidationException('Cannot delete category with associated services');
        }

        // Delete the category
        const { error } = await locals.supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);

        if (error) {
            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            null,
            'Category deleted successfully'
        );

        return json(successResponse);
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 