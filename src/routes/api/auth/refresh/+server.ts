import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException,
    AuthenticationException,
    validateRequired,
    handleAuthError
} from '$lib/exceptions';

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       description: New JWT access token
 *                     refresh_token:
 *                       type: string
 *                       description: New JWT refresh token
 *                     expires_in:
 *                       type: integer
 *                       description: Token expiration time in seconds
 *                     token_type:
 *                       type: string
 *                       example: "Bearer"
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - refresh token required
 *       401:
 *         description: Unauthorized - Invalid refresh token
 *       500:
 *         description: Internal server error
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { refresh_token } = await request.json();

        // Validate required fields
        validateRequired(refresh_token, 'Refresh token');

        // Refresh the session with Supabase
        const { data, error } = await locals.supabase.auth.refreshSession({
            refresh_token
        });

        if (error) {
            const errorResponse = handleAuthError(error);
            return json(errorResponse, { status: errorResponse.error.statusCode });
        }

        if (!data.session) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new AuthenticationException('Failed to refresh session')
            );
            return json(errorResponse, { status: 401 });
        }

        // Calculate expiration info
        const expiresAt = data.session.expires_at ? new Date(data.session.expires_at * 1000) : null;
        const expiresIn = expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 1000) : 0;

        return json({
            data: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_in: expiresIn,
                token_type: 'Bearer'
            },
            message: 'Token refreshed successfully',
            statusCode: 200,
            timestamp: new Date().toISOString()
        }, { status: 200 });

    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 