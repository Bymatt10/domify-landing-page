import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException,
    validateRequired,
    validateEmail
} from '$lib/exceptions';

/**
 * @swagger
 * /api/auth/resend-confirmation:
 *   post:
 *     summary: Resend email confirmation
 *     description: Resend confirmation email to a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Confirmation email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Confirmation email sent successfully"
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { email } = await request.json();

        // Validate required fields
        validateRequired(email, 'Email');
        validateEmail(email);

        // Check if we're in development mode
        const isDevelopment = import.meta.env.DEV;

        // Resend confirmation email
        const { data, error } = await locals.supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: isDevelopment ? undefined : `${import.meta.env.PUBLIC_SITE_URL}/auth/callback`
            }
        });

        if (error) {
            // Handle specific error cases
            if (error.message.includes('User not found')) {
                const errorResponse = ExceptionHandler.createErrorResponse(
                    new ValidationException('User not found with this email address')
                );
                return json(errorResponse, { status: 404 });
            }

            if (error.message.includes('already confirmed')) {
                const errorResponse = ExceptionHandler.createErrorResponse(
                    new ValidationException('Email is already confirmed')
                );
                return json(errorResponse, { status: 400 });
            }

            const errorResponse = ExceptionHandler.handle(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        const message = isDevelopment 
            ? 'Confirmation email sent. In development mode, you can sign in directly.'
            : 'Confirmation email sent successfully. Please check your inbox.';

        return json({
            message,
            developmentMode: isDevelopment
        }, { status: 200 });

    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 