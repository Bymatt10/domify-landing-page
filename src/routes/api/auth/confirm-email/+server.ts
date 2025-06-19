import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException,
    validateRequired
} from '$lib/exceptions';

/**
 * @swagger
 * /api/auth/confirm-email:
 *   post:
 *     summary: Confirm email with verification code
 *     description: Confirm user email using the verification code sent to their email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *               code:
 *                 type: string
 *                 description: Verification code sent to email
 *                 example: "439643"
 *     responses:
 *       200:
 *         description: Email confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email confirmed successfully"
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Invalid verification code
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { email, code } = await request.json();

        // Validate required fields
        validateRequired(email, 'Email');
        validateRequired(code, 'Verification code');

        // Verify the email with the code
        const { data, error } = await locals.supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'signup'
        });

        if (error) {
            // Handle specific error cases
            if (error.message.includes('Invalid token') || error.message.includes('Invalid code')) {
                const errorResponse = ExceptionHandler.createErrorResponse(
                    new ValidationException('Invalid verification code')
                );
                return json(errorResponse, { status: 401 });
            }

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

        return json({
            message: 'Email confirmed successfully. You can now sign in.',
            user: data.user
        }, { status: 200 });

    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 