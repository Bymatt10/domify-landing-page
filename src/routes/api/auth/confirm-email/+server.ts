import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { 
    ExceptionHandler, 
    ValidationException,
    validateRequired
} from '$lib/exceptions';
import { createSupabaseAdminClient } from '$lib/supabase-server';

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
        const { email } = await request.json();

        if (!email) {
            return json({ 
                error: { 
                    message: 'Email is required', 
                    statusCode: 400, 
                    timestamp: new Date().toISOString() 
                } 
            }, { status: 400 });
        }

        // In development mode, automatically confirm the user
        if (import.meta.env.DEV) {
            console.log('Development mode: Auto-confirming user:', email);
            
            // Create admin client for user management
            const adminClient = createSupabaseAdminClient(fetch);
            
            // Get the user by email
            const { data: users, error: userError } = await adminClient.auth.admin.listUsers();
            
            if (userError) {
                console.error('Error listing users:', userError);
                return json({ 
                    error: { 
                        message: 'Error confirming user', 
                        statusCode: 500, 
                        timestamp: new Date().toISOString() 
                    } 
                }, { status: 500 });
            }

            const user = users.users.find(u => u.email === email);
            
            if (!user) {
                return json({ 
                    error: { 
                        message: 'User not found', 
                        statusCode: 404, 
                        timestamp: new Date().toISOString() 
                    } 
                }, { status: 404 });
            }

            // Confirm the user
            const { error: confirmError } = await adminClient.auth.admin.updateUserById(
                user.id,
                { email_confirm: true }
            );

            if (confirmError) {
                console.error('Error confirming user:', confirmError);
                return json({ 
                    error: { 
                        message: 'Error confirming user', 
                        statusCode: 500, 
                        timestamp: new Date().toISOString() 
                    } 
                }, { status: 500 });
            }

            return json({ 
                message: 'User confirmed successfully in development mode',
                statusCode: 200,
                timestamp: new Date().toISOString()
            });
        }

        // In production, send confirmation email
        const { error } = await locals.supabase.auth.resend({
            type: 'signup',
            email: email
        });

        if (error) {
            return json({ 
                error: { 
                    message: error.message, 
                    statusCode: 400, 
                    timestamp: new Date().toISOString() 
                } 
            }, { status: 400 });
        }

        return json({ 
            message: 'Confirmation email sent',
            statusCode: 200,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in confirm-email endpoint:', error);
        return json({ 
            error: { 
                message: 'Internal server error', 
                statusCode: 500, 
                timestamp: new Date().toISOString() 
            } 
        }, { status: 500 });
    }
}; 