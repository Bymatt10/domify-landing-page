import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    const swaggerSpec = {
        openapi: '3.0.0',
        info: {
            title: 'Domify API',
            description: 'Complete API documentation for Domify marketplace platform. All CRUD operations for customers, providers, services, bookings, reviews, payments, and notifications.',
            version: '2.0.0',
            contact: {
                name: 'Domify Support',
                email: 'support@domify.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5173',
                description: 'Development server'
            },
            {
                url: 'https://domify.com',
                description: 'Production server'
            }
        ],
        paths: {
            '/api/health': {
                get: {
                    summary: 'Health check',
                    description: 'Check if the API is running',
                    tags: ['System'],
                    responses: {
                        '200': {
                            description: 'API is healthy',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'ok' },
                                            timestamp: { type: 'string', format: 'date-time' },
                                            version: { type: 'string', example: '2.0.0' },
                                            message: { type: 'string', example: 'Domify API is running!' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/auth/login': {
                post: {
                    summary: 'User login',
                    description: 'Authenticate user and get JWT token',
                    tags: ['Authentication'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email', description: "User's email address", example: 'user@example.com' },
                                        password: { type: 'string', description: "User's password", example: 'password123' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            token: { type: 'string', description: 'JWT access token' },
                                            refresh_token: { type: 'string', description: 'JWT refresh token' },
                                            user: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string', format: 'uuid' },
                                                    email: { type: 'string', format: 'email' },
                                                    role: { type: 'string', enum: ['customer', 'provider', 'admin'] }
                                                }
                                            },
                                            expires_in: { type: 'integer', description: 'Token expiration time in seconds' },
                                            token_type: { type: 'string', example: 'Bearer' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - email and password required' },
                        '401': { description: 'Unauthorized - Invalid credentials' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/auth/register': {
                post: {
                    summary: 'User registration',
                    description: 'Create a new user account',
                    tags: ['Authentication'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password', 'first_name', 'last_name'],
                                    properties: {
                                        email: { type: 'string', format: 'email', description: "User's email address", example: 'user@example.com' },
                                        password: { type: 'string', minLength: 6, description: "User's password (minimum 6 characters)", example: 'password123' },
                                        first_name: { type: 'string', description: "User's first name", example: 'John' },
                                        last_name: { type: 'string', description: "User's last name", example: 'Doe' },
                                        role: { type: 'string', enum: ['customer', 'provider', 'admin'], default: 'customer', description: "User's role" }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'User created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    user: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'string', format: 'uuid' },
                                                            email: { type: 'string', format: 'email' },
                                                            role: { type: 'string', enum: ['customer', 'provider', 'admin'] }
                                                        }
                                                    }
                                                }
                                            },
                                            message: { type: 'string', example: 'User created successfully' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '409': { description: 'Conflict - user already exists' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/auth/refresh': {
                post: {
                    summary: 'Refresh access token',
                    description: 'Get a new access token using a valid refresh token',
                    tags: ['Authentication'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['refresh_token'],
                                    properties: {
                                        refresh_token: { type: 'string', description: 'Valid refresh token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Token refreshed successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            access_token: { type: 'string', description: 'New access token' },
                                            refresh_token: { type: 'string', description: 'New refresh token' },
                                            expires_in: { type: 'integer', description: 'Token expiration time in seconds' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - invalid refresh token' },
                        '401': { description: 'Unauthorized - invalid refresh token' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/auth/logout': {
                post: {
                    summary: 'User logout',
                    description: 'Sign out the user and invalidate the current session',
                    tags: ['Authentication'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'Logout successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: { type: 'string', example: 'Logged out successfully' },
                                            statusCode: { type: 'number', example: 200 },
                                            timestamp: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/me': {
                get: {
                    summary: 'Get current user profile',
                    description: 'Get the profile information of the currently authenticated user',
                    tags: ['Authentication'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'User profile retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    user: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'string', format: 'uuid' },
                                                            email: { type: 'string', format: 'email' },
                                                            role: { type: 'string', enum: ['customer', 'provider', 'admin'] },
                                                            created_at: { type: 'string', format: 'date-time' }
                                                        }
                                                    },
                                                    customer: {
                                                        type: 'object',
                                                        nullable: true,
                                                        properties: {
                                                            id: { type: 'string', format: 'uuid' },
                                                            first_name: { type: 'string' },
                                                            last_name: { type: 'string' },
                                                            phone_number: { type: 'string' },
                                                            address: { type: 'string' }
                                                        }
                                                    },
                                                    provider: {
                                                        type: 'object',
                                                        nullable: true,
                                                        properties: {
                                                            id: { type: 'string', format: 'uuid' },
                                                            business_name: { type: 'string' },
                                                            headline: { type: 'string' },
                                                            bio: { type: 'string' },
                                                            hourly_rate: { type: 'number' },
                                                            average_rating: { type: 'number' },
                                                            total_reviews: { type: 'integer' }
                                                        }
                                                    }
                                                }
                                            },
                                            message: { type: 'string', example: 'User profile retrieved successfully' }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized - No valid session found' },
                        '404': { description: 'User not found' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/customers': {
                get: {
                    summary: 'Get all customers',
                    description: 'Retrieve a list of all customers (admin only)',
                    tags: ['Customers'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 }, description: 'Number of customers to return' },
                        { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 }, description: 'Number of customers to skip' }
                    ],
                    responses: {
                        '200': {
                            description: 'Customers retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { type: 'array', items: { $ref: '#/components/schemas/Customer' } },
                                            total: { type: 'integer' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized' },
                        '403': { description: 'Forbidden - Admin access required' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/customers/{id}': {
                get: {
                    summary: 'Get customer by ID',
                    description: 'Retrieve a specific customer by ID',
                    tags: ['Customers'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Customer ID' }
                    ],
                    responses: {
                        '200': {
                            description: 'Customer retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Customer' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized' },
                        '404': { description: 'Customer not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                put: {
                    summary: 'Update customer',
                    description: 'Update customer information',
                    tags: ['Customers'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Customer ID' }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        first_name: { type: 'string', description: 'First name' },
                                        last_name: { type: 'string', description: 'Last name' },
                                        phone_number: { type: 'string', description: 'Phone number' },
                                        address: { type: 'string', description: 'Address' },
                                        profile_image_url: { type: 'string', description: 'Profile image URL' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Customer updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Customer' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request' },
                        '401': { description: 'Unauthorized' },
                        '404': { description: 'Customer not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                delete: {
                    summary: 'Delete customer',
                    description: 'Soft delete a customer',
                    tags: ['Customers'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Customer ID' }
                    ],
                    responses: {
                        '200': {
                            description: 'Customer deleted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized' },
                        '404': { description: 'Customer not found' },
                        '500': { description: 'Internal server error' }
                    }
                }
            }
        },
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'User unique identifier' },
                        email: { type: 'string', format: 'email', description: 'User email address' },
                        role: { type: 'string', enum: ['customer', 'provider', 'admin'], description: 'User role' },
                        created_at: { type: 'string', format: 'date-time', description: 'User creation timestamp' },
                        updated_at: { type: 'string', format: 'date-time', description: 'User last update timestamp' }
                    },
                    required: ['id', 'email', 'role', 'created_at']
                },
                Customer: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'Customer unique identifier' },
                        user_id: { type: 'string', format: 'uuid', description: 'Associated user ID' },
                        first_name: { type: 'string', description: 'Customer first name' },
                        last_name: { type: 'string', description: 'Customer last name' },
                        phone_number: { type: 'string', description: 'Phone number' },
                        address: { type: 'string', description: 'Address' },
                        profile_image_url: { type: 'string', description: 'Profile image URL' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    },
                    required: ['id', 'user_id', 'first_name', 'last_name', 'created_at']
                },
                Provider: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'Provider unique identifier' },
                        user_id: { type: 'string', format: 'uuid', description: 'Associated user ID' },
                        provider_type: { type: 'string', enum: ['individual', 'company'], description: 'Type of provider' },
                        business_name: { type: 'string', description: 'Business or individual name' },
                        headline: { type: 'string', description: 'Professional headline' },
                        bio: { type: 'string', description: 'Provider biography' },
                        hourly_rate: { type: 'number', minimum: 0, description: 'Hourly rate' },
                        phone: { type: 'string', description: 'Contact phone number' },
                        location: { type: 'string', description: 'Service location' },
                        is_verified: { type: 'boolean', description: 'Verification status' },
                        is_active: { type: 'boolean', description: 'Active status' },
                        average_rating: { type: 'number', minimum: 0, maximum: 5, description: 'Average rating' },
                        total_reviews: { type: 'integer', minimum: 0, description: 'Total number of reviews' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    },
                    required: ['id', 'user_id', 'provider_type', 'business_name', 'headline', 'created_at']
                },
                Service: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'Service unique identifier' },
                        provider_profile_id: { type: 'string', format: 'uuid', description: 'Provider profile ID' },
                        category_id: { type: 'integer', description: 'Category ID' },
                        title: { type: 'string', description: 'Service title' },
                        description: { type: 'string', description: 'Service description' },
                        price: { type: 'number', minimum: 0, description: 'Service price' },
                        location: { type: 'string', description: 'Service location' },
                        is_active: { type: 'boolean', description: 'Active status' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    },
                    required: ['id', 'provider_profile_id', 'category_id', 'title', 'description', 'price', 'created_at']
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'Category ID' },
                        name: { type: 'string', description: 'Category name' },
                        slug: { type: 'string', description: 'Category slug' },
                        description: { type: 'string', description: 'Category description' },
                        icon: { type: 'string', description: 'Category icon' },
                        created_at: { type: 'string', format: 'date-time' }
                    },
                    required: ['id', 'name', 'slug', 'created_at']
                },
                Booking: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'Booking unique identifier' },
                        client_user_id: { type: 'string', format: 'uuid', description: 'Client user ID' },
                        provider_profile_id: { type: 'string', format: 'uuid', description: 'Provider profile ID' },
                        service_id: { type: 'string', format: 'uuid', description: 'Service ID' },
                        start_time: { type: 'string', format: 'date-time', description: 'Booking start time' },
                        end_time: { type: 'string', format: 'date-time', description: 'Booking end time' },
                        status: { type: 'string', enum: ['pending_confirmation', 'confirmed', 'completed', 'payment_succeeded', 'cancelled_by_client', 'cancelled_by_provider'], description: 'Booking status' },
                        total_price: { type: 'number', minimum: 0, description: 'Total price' },
                        notes: { type: 'string', description: 'Booking notes' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    },
                    required: ['id', 'client_user_id', 'provider_profile_id', 'start_time', 'end_time', 'status', 'total_price', 'created_at']
                },
                Review: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'Review unique identifier' },
                        booking_id: { type: 'string', format: 'uuid', description: 'Associated booking ID' },
                        reviewer_user_id: { type: 'string', format: 'uuid', description: 'Reviewer user ID' },
                        provider_profile_id: { type: 'string', format: 'uuid', description: 'Provider profile ID' },
                        rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating (1-5)' },
                        comment: { type: 'string', description: 'Review comment' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    },
                    required: ['id', 'reviewer_user_id', 'provider_profile_id', 'rating', 'created_at']
                },
                Payment: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'Payment unique identifier' },
                        booking_id: { type: 'string', format: 'uuid', description: 'Associated booking ID' },
                        amount: { type: 'number', minimum: 0, description: 'Payment amount' },
                        currency: { type: 'string', description: 'Currency code' },
                        status: { type: 'string', enum: ['pending', 'succeeded', 'failed', 'cash'], description: 'Payment status' },
                        payment_method: { type: 'string', description: 'Payment method' },
                        transaction_id: { type: 'string', description: 'Transaction ID' },
                        created_at: { type: 'string', format: 'date-time' }
                    },
                    required: ['id', 'booking_id', 'amount', 'status', 'payment_method', 'created_at']
                },
                Notification: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'Notification unique identifier' },
                        user_id: { type: 'string', format: 'uuid', description: 'User ID' },
                        title: { type: 'string', description: 'Notification title' },
                        message: { type: 'string', description: 'Notification message' },
                        notification_type: { type: 'string', description: 'Notification type' },
                        is_read: { type: 'boolean', description: 'Read status' },
                        created_at: { type: 'string', format: 'date-time' }
                    },
                    required: ['id', 'user_id', 'title', 'message', 'created_at']
                },
                ProviderApplication: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', description: 'Application unique identifier' },
                        user_id: { type: 'string', format: 'uuid', description: 'User ID' },
                        email: { type: 'string', format: 'email', description: 'Email address' },
                        headline: { type: 'string', description: 'Professional headline' },
                        bio: { type: 'string', description: 'Professional biography' },
                        hourly_rate: { type: 'number', minimum: 0, description: 'Hourly rate' },
                        location: { type: 'string', description: 'Service location' },
                        phone: { type: 'string', description: 'Contact phone number' },
                        status: { type: 'string', enum: ['submitted', 'in_review', 'approved', 'rejected'], description: 'Application status' },
                        application_data: { type: 'object', description: 'Additional application data' },
                        rejection_reason: { type: 'string', description: 'Rejection reason' },
                        submitted_at: { type: 'string', format: 'date-time' },
                        reviewed_at: { type: 'string', format: 'date-time' },
                        reviewed_by_admin_id: { type: 'string', format: 'uuid', description: 'Admin who reviewed the application' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    },
                    required: ['id', 'headline', 'bio', 'hourly_rate', 'location', 'phone', 'status', 'submitted_at', 'created_at']
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token for authentication. Use the login endpoint to get a valid token.'
                }
            }
        },
        tags: [
            {
                name: 'System',
                description: 'System health and status operations'
            },
            {
                name: 'Authentication',
                description: 'User authentication, registration, and profile management'
            },
            {
                name: 'Customers',
                description: 'Customer profile management operations'
            },
            {
                name: 'Providers',
                description: 'Service provider management operations'
            },
            {
                name: 'Services',
                description: 'Service marketplace operations'
            },
            {
                name: 'Categories',
                description: 'Service category management operations'
            },
            {
                name: 'Bookings',
                description: 'Booking management operations'
            },
            {
                name: 'Reviews',
                description: 'Review and rating operations'
            },
            {
                name: 'Payments',
                description: 'Payment management operations'
            },
            {
                name: 'Notifications',
                description: 'Notification management operations'
            },
            {
                name: 'ProviderApplications',
                description: 'Provider application management operations'
            },
            {
                name: 'Contact',
                description: 'Contact platform support'
            }
        ]
    };

    return json(swaggerSpec);
}; 