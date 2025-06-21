import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { ExceptionHandler, ValidationException, DatabaseException } from '$lib/exceptions';
import { requirePermissions, requireOwnership } from '$lib/auth-middleware';

/**
 * @swagger
 * /api/customer/bookings:
 *   get:
 *     summary: Get customer bookings
 *     description: Retrieve all bookings for the authenticated customer
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer access required
 */
export const GET: RequestHandler = async (event) => {
    try {
        // Require customer permissions
        const user = await requirePermissions(event, ['view_own_bookings']);
        
        const { locals } = event;
        
        // Get customer's bookings
        const { data: bookings, error: bookingsError } = await locals.supabase
            .from('bookings')
            .select(`
                *,
                provider_profiles (
                    id,
                    business_name,
                    headline,
                    average_rating
                ),
                services (
                    id,
                    title,
                    description,
                    price
                )
            `)
            .eq('client_user_id', user.id)
            .order('created_at', { ascending: false });

        if (bookingsError) {
            console.error('Error fetching bookings:', bookingsError);
            const errorResponse = ExceptionHandler.createErrorResponse(
                new DatabaseException('Failed to fetch bookings')
            );
            return json(errorResponse, { status: 500 });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            {
                bookings: bookings || [],
                total: bookings?.length || 0
            },
            'Bookings retrieved successfully'
        );

        return json(successResponse);

    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
};

/**
 * @swagger
 * /api/customer/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Create a new booking for a service. Customer access required.
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider_profile_id
 *               - service_id
 *               - start_time
 *               - end_time
 *               - total_price
 *             properties:
 *               provider_profile_id:
 *                 type: string
 *                 format: uuid
 *               service_id:
 *                 type: integer
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               total_price:
 *                 type: number
 *               notes_for_provider:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer access required
 */
export const POST: RequestHandler = async (event) => {
    try {
        // Require customer permissions
        const user = await requirePermissions(event, ['create_bookings']);
        
        const { locals } = event;
        const bookingData = await event.request.json();
        
        // Validate required fields
        const { provider_profile_id, service_id, start_time, end_time, total_price } = bookingData;
        
        if (!provider_profile_id || !service_id || !start_time || !end_time || !total_price) {
            const errorResponse = ExceptionHandler.createErrorResponse(
                new ValidationException('Missing required fields: provider_profile_id, service_id, start_time, end_time, total_price')
            );
            return json(errorResponse, { status: 400 });
        }

        // Create booking
        const { data: newBooking, error: bookingError } = await locals.supabase
            .from('bookings')
            .insert({
                client_user_id: user.id,
                provider_profile_id,
                service_id,
                start_time,
                end_time,
                total_price,
                notes_for_provider: bookingData.notes_for_provider || null,
                status: 'pending_confirmation'
            })
            .select(`
                *,
                provider_profiles (
                    id,
                    business_name,
                    headline
                ),
                services (
                    id,
                    title,
                    description,
                    price
                )
            `)
            .single();

        if (bookingError) {
            console.error('Error creating booking:', bookingError);
            const errorResponse = ExceptionHandler.createErrorResponse(
                new DatabaseException('Failed to create booking')
            );
            return json(errorResponse, { status: 500 });
        }

        const successResponse = ExceptionHandler.createSuccessResponse(
            newBooking,
            'Booking created successfully',
            201
        );

        return json(successResponse, { status: 201 });

    } catch (error) {
        const errorResponse = ExceptionHandler.handle(error);
        return json(errorResponse, { status: errorResponse.error.statusCode });
    }
}; 