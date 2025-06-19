import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler } from '$lib/exceptions';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "ok"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                 message:
 *                   type: string
 *                   example: "Domify API is running!"
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
export const GET: RequestHandler = async () => {
    try {
        const healthData = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };

        const successResponse = ExceptionHandler.createSuccessResponse(
            healthData,
            'Domify API is running!'
        );

        return json(successResponse);
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 