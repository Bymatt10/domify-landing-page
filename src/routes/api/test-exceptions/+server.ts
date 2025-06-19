import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    ExceptionHandler, 
    ValidationException, 
    AuthenticationException,
    NotFoundException,
    ConflictException,
    validateRequired,
    validateEmail
} from '$lib/exceptions';

/**
 * @swagger
 * /api/test-exceptions:
 *   get:
 *     summary: Test exception handling
 *     description: Test various types of exceptions to see how they are handled
 *     tags: [Testing]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [validation, auth, notfound, conflict, database, generic]
 *         description: Type of exception to test
 *     responses:
 *       200:
 *         description: Success response
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication error
 *       404:
 *         description: Not found error
 *       409:
 *         description: Conflict error
 *       500:
 *         description: Internal server error
 */
export const GET: RequestHandler = async ({ url }) => {
    const exceptionType = url.searchParams.get('type');

    try {
        switch (exceptionType) {
            case 'validation':
                throw new ValidationException('This is a validation error', { field: 'test' });
            
            case 'auth':
                throw new AuthenticationException('This is an authentication error');
            
            case 'notfound':
                throw new NotFoundException('User');
            
            case 'conflict':
                throw new ConflictException('Resource already exists');
            
            case 'database':
                throw new Error('Database connection failed');
            
            case 'generic':
                throw new Error('This is a generic error');
            
            default:
                const successResponse = ExceptionHandler.createSuccessResponse(
                    { message: 'Exception handling system is working!' },
                    'Test completed successfully'
                );
                return json(successResponse);
        }
    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};

/**
 * @swagger
 * /api/test-exceptions:
 *   post:
 *     summary: Test validation helpers
 *     description: Test the validation helper functions
 *     tags: [Testing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validation passed
 *       400:
 *         description: Validation failed
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { email, password, name } = await request.json();

        // Test validation helpers
        validateRequired(email, 'Email');
        validateRequired(password, 'Password');
        validateRequired(name, 'Name');
        validateEmail(email);

        if (password.length < 6) {
            throw new ValidationException('Password must be at least 6 characters long');
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            { email, name },
            'All validations passed!'
        );
        return json(successResponse);

    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 