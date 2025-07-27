import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    const swaggerSpec = {
        openapi: '3.0.0',
        info: {
            title: 'Domify API',
            description: 'API documentation for Domify marketplace platform. Complete CRUD operations for all entities. Use the login endpoint to get a valid JWT token for protected endpoints.',
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
                                        email: {
                                            type: 'string',
                                            format: 'email',
                                            description: "User's email address",
                                            example: 'user@example.com'
                                        },
                                        password: {
                                            type: 'string',
                                            description: "User's password",
                                            example: 'password123'
                                        }
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
                                            token: {
                                                type: 'string',
                                                description: 'JWT access token'
                                            },
                                            refresh_token: {
                                                type: 'string',
                                                description: 'JWT refresh token'
                                            },
                                            user: {
                                                type: 'object',
                                                properties: {
                                                    id: {
                                                        type: 'string',
                                                        format: 'uuid'
                                                    },
                                                    email: {
                                                        type: 'string',
                                                        format: 'email'
                                                    },
                                                    role: {
                                                        type: 'string',
                                                        enum: ['provider', 'admin']
                                                    }
                                                }
                                            },
                                            expires_in: {
                                                type: 'integer',
                                                description: 'Token expiration time in seconds'
                                            },
                                            token_type: {
                                                type: 'string',
                                                example: 'Bearer'
                                            }
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
                                        email: {
                                            type: 'string',
                                            format: 'email',
                                            description: "User's email address",
                                            example: 'user@example.com'
                                        },
                                        password: {
                                            type: 'string',
                                            minLength: 6,
                                            description: "User's password (minimum 6 characters)",
                                            example: 'password123'
                                        },
                                        first_name: {
                                            type: 'string',
                                            description: "User's first name",
                                            example: 'John'
                                        },
                                        last_name: {
                                            type: 'string',
                                            description: "User's last name",
                                            example: 'Doe'
                                        },
                                        role: {
                                            type: 'string',
                                            enum: ['customer', 'provider', 'admin'],
                                            default: 'customer',
                                            description: "User's role"
                                        }
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
                                                            id: {
                                                                type: 'string',
                                                                format: 'uuid'
                                                            },
                                                            email: {
                                                                type: 'string',
                                                                format: 'email'
                                                            },
                                                            role: {
                                                                type: 'string',
                                                                enum: ['customer', 'provider', 'admin']
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'User created successfully'
                                            }
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
                                        refresh_token: {
                                            type: 'string',
                                            description: 'Valid refresh token',
                                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                        }
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
                                            access_token: {
                                                type: 'string',
                                                description: 'New access token'
                                            },
                                            refresh_token: {
                                                type: 'string',
                                                description: 'New refresh token'
                                            },
                                            expires_in: {
                                                type: 'integer',
                                                description: 'Token expiration time in seconds'
                                            }
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
                                            message: {
                                                type: 'string',
                                                example: 'Logged out successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
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
            '/api/auth/confirm-email': {
                post: {
                    summary: 'Confirm email with verification code',
                    description: 'Confirm user email using the verification code sent to their email',
                    tags: ['Authentication'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email'],
                                    properties: {
                                        email: {
                                            type: 'string',
                                            format: 'email',
                                            description: "User's email address",
                                            example: 'user@example.com'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Email confirmed successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Email confirmed successfully'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '404': { description: 'User not found' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/auth/resend-confirmation': {
                post: {
                    summary: 'Resend email confirmation',
                    description: 'Resend confirmation email to a user',
                    tags: ['Authentication'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email'],
                                    properties: {
                                        email: {
                                            type: 'string',
                                            format: 'email',
                                            description: "User's email address",
                                            example: 'user@example.com'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Confirmation email sent successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Confirmation email sent successfully'
                                            },
                                            developmentMode: {
                                                type: 'boolean',
                                                description: 'Whether the system is in development mode'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '404': { description: 'User not found' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/users': {
                get: {
                    summary: 'Get all users',
                    description: 'Retrieve a list of all users in the system',
                    tags: ['Users'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'List of users retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            users: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/User' }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token' },
                        '500': { description: 'Internal server error' }
                    }
                },
                post: {
                    summary: 'Create a new user',
                    description: 'Create a new user in the system',
                    tags: ['Users'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: {
                                            type: 'string',
                                            format: 'email',
                                            description: "User's email address"
                                        },
                                        password: {
                                            type: 'string',
                                            minLength: 6,
                                            description: "User's password"
                                        },
                                        role: {
                                            type: 'string',
                                            enum: ['provider', 'admin'],
                                            default: 'provider',
                                            description: "User's role (defaults to provider)"
                                        }
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
                                    schema: { $ref: '#/components/schemas/User' }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '409': { description: 'Conflict - user already exists' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/users/{id}': {
                get: {
                    summary: 'Get user by ID',
                    description: 'Retrieve a specific user by their ID',
                    tags: ['Users'],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'string',
                                format: 'uuid'
                            },
                            description: 'User ID'
                        }
                    ],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'User retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/User' },
                                            message: {
                                                type: 'string',
                                                example: 'User retrieved successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token' },
                        '404': { description: 'User not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                put: {
                    summary: 'Update user',
                    description: 'Update a specific user\'s information',
                    tags: ['Users'],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'string',
                                format: 'uuid'
                            },
                            description: 'User ID'
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        first_name: {
                                            type: 'string',
                                            description: 'User\'s first name'
                                        },
                                        last_name: {
                                            type: 'string',
                                            description: 'User\'s last name'
                                        },
                                        role: {
                                            type: 'string',
                                            enum: ['customer', 'provider', 'admin'],
                                            description: 'User\'s role'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'User updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/User' },
                                            message: {
                                                type: 'string',
                                                example: 'User updated successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token' },
                        '404': { description: 'User not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                delete: {
                    summary: 'Delete user',
                    description: 'Soft delete a user',
                    tags: ['Users'],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'string',
                                format: 'uuid'
                            },
                            description: 'User ID'
                        }
                    ],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'User deleted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'User deleted successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token' },
                        '404': { description: 'User not found' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/categories': {
                get: {
                    summary: 'Get all categories',
                    description: 'Retrieve a list of all service categories in the marketplace',
                    tags: ['Categories'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'limit',
                            schema: {
                                type: 'integer',
                                default: 50
                            },
                            description: 'Number of categories to return'
                        },
                        {
                            in: 'query',
                            name: 'offset',
                            schema: {
                                type: 'integer',
                                default: 0
                            },
                            description: 'Number of categories to skip'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'List of categories retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    categories: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Category' }
                                                    },
                                                    total: {
                                                        type: 'integer',
                                                        description: 'Total number of categories'
                                                    }
                                                }
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Categories retrieved successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '500': { description: 'Internal server error' }
                    }
                },
                post: {
                    summary: 'Create a new category',
                    description: 'Create a new service category (admin only)',
                    tags: ['Categories'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['name', 'path_image'],
                                    properties: {
                                        name: {
                                            type: 'string',
                                            description: 'Category name',
                                            example: 'Ensamblaje'
                                        },
                                        path_image: {
                                            type: 'string',
                                            description: 'Path to category image',
                                            example: '/img/assembly.png'
                                        },
                                        description: {
                                            type: 'string',
                                            description: 'Category description',
                                            example: 'Servicios de ensamblaje de muebles y equipos'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'Category created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Category' },
                                            message: {
                                                type: 'string',
                                                example: 'Category created successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 201
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token, or insufficient permissions' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/categories/seed': {
                post: {
                    summary: 'Seed categories',
                    description: 'Populate the database with initial service categories for onboarding',
                    tags: ['Categories'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '201': {
                            description: 'Categories seeded successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    categories: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Category' }
                                                    }
                                                }
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Categories seeded successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 201
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - categories already exist' },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token, or insufficient permissions' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/categories/{id}': {
                get: {
                    summary: 'Get category by ID',
                    description: 'Retrieve a specific category by its ID',
                    tags: ['Categories'],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'integer' },
                            description: 'Category ID'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Category retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Category' },
                                            message: {
                                                type: 'string',
                                                example: 'Category retrieved successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '404': { description: 'Category not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                put: {
                    summary: 'Update category',
                    description: 'Update an existing category (admin only)',
                    tags: ['Categories'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'integer' },
                            description: 'Category ID'
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: {
                                            type: 'string',
                                            description: 'Category name',
                                            example: 'Ensamblaje de Muebles'
                                        },
                                        path_image: {
                                            type: 'string',
                                            description: 'Path to category image',
                                            example: '/img/assembly.png'
                                        },
                                        description: {
                                            type: 'string',
                                            description: 'Category description',
                                            example: 'Servicios de ensamblaje de muebles y equipos'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Category updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Category' },
                                            message: {
                                                type: 'string',
                                                example: 'Category updated successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token, or insufficient permissions' },
                        '404': { description: 'Category not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                delete: {
                    summary: 'Delete category',
                    description: 'Delete a category (admin only). Cannot delete if it has subcategories or services.',
                    tags: ['Categories'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'integer' },
                            description: 'Category ID'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Category deleted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Category deleted successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - category has subcategories or services' },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token, or insufficient permissions' },
                        '404': { description: 'Category not found' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/services': {
                get: {
                    summary: 'Get all services',
                    description: 'Retrieve a list of all services in the marketplace',
                    tags: ['Services'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'category_id',
                            schema: { type: 'integer' },
                            description: 'Filter by category ID'
                        },
                        {
                            in: 'query',
                            name: 'provider_profile_id',
                            schema: {
                                type: 'string',
                                format: 'uuid'
                            },
                            description: 'Filter by provider ID'
                        },
                        {
                            in: 'query',
                            name: 'limit',
                            schema: {
                                type: 'integer',
                                default: 20
                            },
                            description: 'Number of services to return'
                        },
                        {
                            in: 'query',
                            name: 'offset',
                            schema: {
                                type: 'integer',
                                default: 0
                            },
                            description: 'Number of services to skip'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'List of services retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            services: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/Service' }
                                            },
                                            total: {
                                                type: 'integer',
                                                description: 'Total number of services'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '500': { description: 'Internal server error' }
                    }
                },
                post: {
                    summary: 'Create a new service',
                    description: 'Create a new service in the marketplace',
                    tags: ['Services'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['title', 'description', 'price', 'category_id'],
                                    properties: {
                                        title: {
                                            type: 'string',
                                            description: 'Service title'
                                        },
                                        description: {
                                            type: 'string',
                                            description: 'Service description'
                                        },
                                        price: {
                                            type: 'number',
                                            minimum: 0,
                                            description: 'Service price'
                                        },
                                        category_id: {
                                            type: 'integer',
                                            description: 'Category ID'
                                        },
                                        location: {
                                            type: 'string',
                                            description: 'Service location'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'Service created successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/Service' }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/providers': {
                get: {
                    summary: 'Get all providers',
                    description: 'Retrieve a list of all service providers in the marketplace',
                    tags: ['Providers'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'category_id',
                            schema: {
                                type: 'integer'
                            },
                            description: 'Filter by category ID'
                        },
                        {
                            in: 'query',
                            name: 'provider_type',
                            schema: {
                                type: 'string',
                                enum: ['individual', 'company']
                            },
                            description: 'Filter by provider type'
                        },
                        {
                            in: 'query',
                            name: 'limit',
                            schema: {
                                type: 'integer',
                                default: 20
                            },
                            description: 'Number of providers to return'
                        },
                        {
                            in: 'query',
                            name: 'offset',
                            schema: {
                                type: 'integer',
                                default: 0
                            },
                            description: 'Number of providers to skip'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'List of providers retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    providers: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Provider' }
                                                    },
                                                    total: {
                                                        type: 'integer',
                                                        description: 'Total number of providers'
                                                    }
                                                }
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Providers retrieved successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '500': { description: 'Internal server error' }
                    }
                },
                post: {
                    summary: 'Create a new provider',
                    description: 'Create a new service provider profile',
                    tags: ['Providers'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['user_id', 'provider_type', 'business_name', 'description', 'hourly_rate', 'category_ids'],
                                    properties: {
                                        user_id: {
                                            type: 'string',
                                            format: 'uuid',
                                            description: 'User ID from auth'
                                        },
                                        provider_type: {
                                            type: 'string',
                                            enum: ['individual', 'company'],
                                            description: 'Type of provider'
                                        },
                                        business_name: {
                                            type: 'string',
                                            description: 'Business or individual name'
                                        },
                                        description: {
                                            type: 'string',
                                            description: 'Provider description'
                                        },
                                        hourly_rate: {
                                            type: 'number',
                                            minimum: 0,
                                            description: 'Hourly rate in USD'
                                        },
                                        photo_url: {
                                            type: 'string',
                                            description: 'Profile photo URL'
                                        },
                                        phone: {
                                            type: 'string',
                                            description: 'Contact phone number'
                                        },
                                        location: {
                                            type: 'string',
                                            description: 'Service location'
                                        },
                                        category_ids: {
                                            type: 'array',
                                            items: {
                                                type: 'integer'
                                            },
                                            description: 'Array of category IDs the provider specializes in'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '201': {
                            description: 'Provider created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Provider' },
                                            message: {
                                                type: 'string',
                                                example: 'Provider created successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 201
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/providers/{id}': {
                get: {
                    summary: 'Get provider by ID',
                    description: 'Retrieve a specific provider by their ID',
                    tags: ['Providers'],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'string',
                                format: 'uuid'
                            },
                            description: 'Provider ID'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Provider retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Provider' },
                                            message: {
                                                type: 'string',
                                                example: 'Provider retrieved successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '404': { description: 'Provider not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                put: {
                    summary: 'Update provider',
                    description: 'Update a specific provider\'s information',
                    tags: ['Providers'],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'string',
                                format: 'uuid'
                            },
                            description: 'Provider ID'
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        business_name: {
                                            type: 'string',
                                            description: 'Business or individual name'
                                        },
                                        description: {
                                            type: 'string',
                                            description: 'Provider description'
                                        },
                                        hourly_rate: {
                                            type: 'number',
                                            minimum: 0,
                                            description: 'Hourly rate in USD'
                                        },
                                        photo_url: {
                                            type: 'string',
                                            description: 'Profile photo URL'
                                        },
                                        phone: {
                                            type: 'string',
                                            description: 'Contact phone number'
                                        },
                                        location: {
                                            type: 'string',
                                            description: 'Service location'
                                        },
                                        category_ids: {
                                            type: 'array',
                                            items: {
                                                type: 'integer'
                                            },
                                            description: 'Array of category IDs the provider specializes in'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'Provider updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Provider' },
                                            message: {
                                                type: 'string',
                                                example: 'Provider updated successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token' },
                        '404': { description: 'Provider not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                delete: {
                    summary: 'Delete provider',
                    description: 'Soft delete a provider profile',
                    tags: ['Providers'],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'string',
                                format: 'uuid'
                            },
                            description: 'Provider ID'
                        }
                    ],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'Provider deleted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Provider deleted successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token' },
                        '404': { description: 'Provider not found' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/providers/seed': {
                post: {
                    summary: 'Seed providers',
                    description: 'Populate the database with sample service providers for testing',
                    tags: ['Providers'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '201': {
                            description: 'Providers seeded successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    providers: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Provider' }
                                                    }
                                                }
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Providers seeded successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 201
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
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
                                                            id: {
                                                                type: 'string',
                                                                format: 'uuid'
                                                            },
                                                            email: {
                                                                type: 'string',
                                                                format: 'email'
                                                            },
                                                            role: {
                                                                type: 'string',
                                                                enum: ['customer', 'provider', 'admin']
                                                            },
                                                            created_at: {
                                                                type: 'string',
                                                                format: 'date-time'
                                                            }
                                                        }
                                                    },
                                                    customer: {
                                                        type: 'object',
                                                        nullable: true,
                                                        properties: {
                                                            id: {
                                                                type: 'string',
                                                                format: 'uuid'
                                                            },
                                                            first_name: {
                                                                type: 'string'
                                                            },
                                                            last_name: {
                                                                type: 'string'
                                                            },
                                                            phone_number: {
                                                                type: 'string'
                                                            },
                                                            address: {
                                                                type: 'string'
                                                            }
                                                        }
                                                    },
                                                    provider: {
                                                        type: 'object',
                                                        nullable: true,
                                                        properties: {
                                                            id: {
                                                                type: 'string',
                                                                format: 'uuid'
                                                            },
                                                            business_name: {
                                                                type: 'string'
                                                            },
                                                            headline: {
                                                                type: 'string'
                                                            },
                                                            bio: {
                                                                type: 'string'
                                                            },
                                                            hourly_rate: {
                                                                type: 'number'
                                                            },
                                                            average_rating: {
                                                                type: 'number'
                                                            },
                                                            total_reviews: {
                                                                type: 'integer'
                                                            }
                                                        }
                                                    },
                                                    permissions: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'string'
                                                        }
                                                    }
                                                }
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'User profile retrieved successfully'
                                            },
                                            statusCode: {
                                                type: 'number',
                                                example: 200
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            }
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
            '/api/customer/bookings': {
                get: {
                    summary: 'Get customer bookings',
                    description: 'Retrieve all bookings for the authenticated customer',
                    tags: ['Customer'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'Customer bookings retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    bookings: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'object',
                                                            properties: {
                                                                id: {
                                                                    type: 'string',
                                                                    format: 'uuid'
                                                                },
                                                                start_time: {
                                                                    type: 'string',
                                                                    format: 'date-time'
                                                                },
                                                                end_time: {
                                                                    type: 'string',
                                                                    format: 'date-time'
                                                                },
                                                                status: {
                                                                    type: 'string',
                                                                    enum: ['pending_confirmation', 'confirmed', 'completed', 'cancelled']
                                                                },
                                                                total_price: {
                                                                    type: 'number'
                                                                },
                                                                provider_profiles: {
                                                                    type: 'object',
                                                                    properties: {
                                                                        id: {
                                                                            type: 'string',
                                                                            format: 'uuid'
                                                                        },
                                                                        business_name: {
                                                                            type: 'string'
                                                                        },
                                                                        headline: {
                                                                            type: 'string'
                                                                        },
                                                                        average_rating: {
                                                                            type: 'number'
                                                                        }
                                                                    }
                                                                },
                                                                services: {
                                                                    type: 'object',
                                                                    properties: {
                                                                        id: {
                                                                            type: 'string',
                                                                            format: 'uuid'
                                                                        },
                                                                        title: {
                                                                            type: 'string'
                                                                        },
                                                                        description: {
                                                                            type: 'string'
                                                                        },
                                                                        price: {
                                                                            type: 'number'
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    total: {
                                                        type: 'integer'
                                                    }
                                                }
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Bookings retrieved successfully'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized' },
                        '403': { description: 'Forbidden - Customer access required' },
                        '500': { description: 'Internal server error' }
                    }
                },
                post: {
                    summary: 'Create a new booking',
                    description: 'Create a new booking for a service. Customer access required.',
                    tags: ['Customer'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['provider_profile_id', 'service_id', 'start_time', 'end_time', 'total_price'],
                                    properties: {
                                        provider_profile_id: {
                                            type: 'string',
                                            format: 'uuid',
                                            description: 'Provider profile ID'
                                        },
                                        service_id: {
                                            type: 'string',
                                            format: 'uuid',
                                            description: 'Service ID'
                                        },
                                        start_time: {
                                            type: 'string',
                                            format: 'date-time',
                                            description: 'Booking start time'
                                        },
                                        end_time: {
                                            type: 'string',
                                            format: 'date-time',
                                            description: 'Booking end time'
                                        },
                                        total_price: {
                                            type: 'number',
                                            description: 'Total price for the booking'
                                        },
                                        notes_for_provider: {
                                            type: 'string',
                                            description: 'Notes for the provider'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'Booking created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    id: {
                                                        type: 'string',
                                                        format: 'uuid'
                                                    },
                                                    status: {
                                                        type: 'string',
                                                        example: 'pending_confirmation'
                                                    }
                                                }
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Booking created successfully'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '401': { description: 'Unauthorized' },
                        '403': { description: 'Forbidden - Customer access required' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/provider_applications': {
                get: {
                    summary: 'List or get provider applications',
                    description: 'Retrieve all provider applications or a single one by id',
                    tags: ['ProviderApplications'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'id',
                            schema: { type: 'integer' },
                            description: 'Application ID'
                        },
                        {
                            in: 'query',
                            name: 'user_id',
                            schema: { type: 'string', format: 'uuid' },
                            description: 'Filter by user_id'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Applications retrieved',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/ProviderApplication' }
                                            },
                                            message: { type: 'string' },
                                            statusCode: { type: 'number' },
                                            timestamp: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Error' }
                    }
                },
                post: {
                    summary: 'Create a provider application',
                    description: 'Submit a new provider application',
                    tags: ['ProviderApplications'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['user_id', 'status', 'application_data'],
                                    properties: {
                                        user_id: { type: 'string', format: 'uuid' },
                                        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                                        application_data: { type: 'object' },
                                        rejection_reason: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'Application created',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/ProviderApplication' },
                                            message: { type: 'string' },
                                            statusCode: { type: 'number' },
                                            timestamp: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Error' }
                    }
                },
                put: {
                    summary: 'Update a provider application',
                    description: 'Update status, rejection_reason, or review fields',
                    tags: ['ProviderApplications'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'id',
                            schema: { type: 'integer' },
                            required: true,
                            description: 'Application ID'
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                                        rejection_reason: { type: 'string' },
                                        reviewed_at: { type: 'string', format: 'date-time' },
                                        reviewed_by_admin_id: { type: 'string', format: 'uuid' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Application updated',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/ProviderApplication' },
                                            message: { type: 'string' },
                                            statusCode: { type: 'number' },
                                            timestamp: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Error' }
                    }
                },
                delete: {
                    summary: 'Delete (soft) a provider application',
                    description: 'Soft delete by setting rejection_reason and status to rejected',
                    tags: ['ProviderApplications'],
                    parameters: [
                        {
                            in: 'query',
                            name: 'id',
                            schema: { type: 'integer' },
                            required: true,
                            description: 'Application ID'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Application soft deleted',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/ProviderApplication' },
                                            message: { type: 'string' },
                                            statusCode: { type: 'number' },
                                            timestamp: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Error' }
                    }
                }
            },
            '/api/provider_applications/stats': {
                get: {
                    summary: 'Get provider applications statistics',
                    description: 'Retrieve statistics for provider applications (admin only)',
                    tags: ['ProviderApplications'],
                    security: [
                        {
                            bearerAuth: []
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Statistics retrieved',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            total: {
                                                type: 'integer',
                                                description: 'Total number of applications'
                                            },
                                            pending: {
                                                type: 'integer',
                                                description: 'Number of pending applications'
                                            },
                                            under_review: {
                                                type: 'integer',
                                                description: 'Number of applications under review'
                                            },
                                            approved: {
                                                type: 'integer',
                                                description: 'Number of approved applications'
                                            },
                                            rejected: {
                                                type: 'integer',
                                                description: 'Number of rejected applications'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Admin access required' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/provider_applications/my-application': {
                get: {
                    summary: 'Get current user\'s provider application',
                    description: 'Retrieve the current user\'s provider application status and details',
                    tags: ['ProviderApplications'],
                    security: [
                        {
                            bearerAuth: []
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Application retrieved',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                oneOf: [
                                                    { $ref: '#/components/schemas/ProviderApplication' },
                                                    { type: 'null' }
                                                ]
                                            },
                                            message: {
                                                type: 'string'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized - No token provided' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/become-provider': {
                post: {
                    summary: 'Become a provider',
                    description: 'Submit an application to become a service provider',
                    tags: ['ProviderApplications'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['headline', 'bio', 'hourly_rate', 'location', 'phone', 'categories'],
                                    properties: {
                                        headline: {
                                            type: 'string',
                                            description: 'Professional headline or title',
                                            example: 'Experienced Home Service Professional'
                                        },
                                        bio: {
                                            type: 'string',
                                            description: 'Professional biography and experience',
                                            example: 'I have over 5 years of experience in home services...'
                                        },
                                        hourly_rate: {
                                            type: 'number',
                                            minimum: 0,
                                            description: 'Hourly rate in local currency',
                                            example: 25.00
                                        },
                                        location: {
                                            type: 'string',
                                            description: 'Service location or area',
                                            example: 'Managua, Nicaragua'
                                        },
                                        phone: {
                                            type: 'string',
                                            description: 'Contact phone number',
                                            example: '+505 8888 8888'
                                        },
                                        experience_years: {
                                            type: 'integer',
                                            minimum: 0,
                                            description: 'Years of experience',
                                            example: 5
                                        },
                                        certifications: {
                                            type: 'array',
                                            items: {
                                                type: 'string'
                                            },
                                            description: 'List of certifications',
                                            example: ['Professional License', 'Safety Certification']
                                        },
                                        categories: {
                                            type: 'array',
                                            items: {
                                                type: 'integer'
                                            },
                                            description: 'Array of category IDs the provider specializes in',
                                            example: [1, 2, 3]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'Application submitted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    applicationId: {
                                                        type: 'integer',
                                                        description: 'Application ID'
                                                    }
                                                }
                                            },
                                            message: {
                                                type: 'string',
                                                example: '¡Felicidades! Tu aplicación fue aprobada y ya eres un proveedor.'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
                        '401': { description: 'Unauthorized - No token provided' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/contact': {
                post: {
                    summary: 'Send contact message',
                    description: 'Send a contact message to the platform support',
                    tags: ['Contact'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['nombre', 'email', 'asunto', 'mensaje'],
                                    properties: {
                                        nombre: { type: 'string', description: 'Contact name', example: 'Juan Pérez' },
                                        email: { type: 'string', format: 'email', description: 'Contact email', example: 'juan@example.com' },
                                        asunto: { type: 'string', description: 'Message subject', example: 'Consulta sobre servicios' },
                                        mensaje: { type: 'string', description: 'Message content', example: 'Hola, tengo una pregunta sobre...' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'Message sent successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { type: 'object', properties: { messageId: { type: 'string', description: 'Email message ID' } } },
                                            message: { type: 'string', example: 'Mensaje enviado correctamente. Te responderemos pronto.' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request - validation error' },
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
            },
            '/api/services/{id}': {
                get: {
                    summary: 'Get service by ID',
                    description: 'Retrieve a specific service by ID',
                    tags: ['Services'],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Service ID' }
                    ],
                    responses: {
                        '200': {
                            description: 'Service retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Service' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '404': { description: 'Service not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                put: {
                    summary: 'Update service',
                    description: 'Update service information',
                    tags: ['Services'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Service ID' }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string', description: 'Service title' },
                                        description: { type: 'string', description: 'Service description' },
                                        price: { type: 'number', minimum: 0, description: 'Service price' },
                                        location: { type: 'string', description: 'Service location' },
                                        is_active: { type: 'boolean', description: 'Service active status' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Service updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Service' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request' },
                        '401': { description: 'Unauthorized' },
                        '403': { description: 'Forbidden' },
                        '404': { description: 'Service not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                delete: {
                    summary: 'Delete service',
                    description: 'Soft delete a service',
                    tags: ['Services'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Service ID' }
                    ],
                    responses: {
                        '200': {
                            description: 'Service deleted successfully',
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
                        '403': { description: 'Forbidden' },
                        '404': { description: 'Service not found' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/bookings': {
                get: {
                    summary: 'Get all bookings',
                    description: 'Retrieve a list of all bookings (admin only)',
                    tags: ['Bookings'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'query', name: 'status', schema: { type: 'string', enum: ['pending_confirmation', 'confirmed', 'completed', 'payment_succeeded', 'cancelled_by_client', 'cancelled_by_provider'] }, description: 'Filter by booking status' },
                        { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 }, description: 'Number of bookings to return' },
                        { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 }, description: 'Number of bookings to skip' }
                    ],
                    responses: {
                        '200': {
                            description: 'Bookings retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { type: 'array', items: { $ref: '#/components/schemas/Booking' } },
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
            '/api/bookings/{id}': {
                get: {
                    summary: 'Get booking by ID',
                    description: 'Retrieve a specific booking by ID',
                    tags: ['Bookings'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Booking ID' }
                    ],
                    responses: {
                        '200': {
                            description: 'Booking retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Booking' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized' },
                        '404': { description: 'Booking not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                put: {
                    summary: 'Update booking',
                    description: 'Update booking status and information',
                    tags: ['Bookings'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Booking ID' }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', enum: ['pending_confirmation', 'confirmed', 'completed', 'payment_succeeded', 'cancelled_by_client', 'cancelled_by_provider'], description: 'Booking status' },
                                        start_time: { type: 'string', format: 'date-time', description: 'Booking start time' },
                                        end_time: { type: 'string', format: 'date-time', description: 'Booking end time' },
                                        total_price: { type: 'number', minimum: 0, description: 'Total price' },
                                        notes: { type: 'string', description: 'Booking notes' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Booking updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Booking' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request' },
                        '401': { description: 'Unauthorized' },
                        '404': { description: 'Booking not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                delete: {
                    summary: 'Delete booking',
                    description: 'Soft delete a booking',
                    tags: ['Bookings'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Booking ID' }
                    ],
                    responses: {
                        '200': {
                            description: 'Booking deleted successfully',
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
                        '404': { description: 'Booking not found' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/reviews': {
                get: {
                    summary: 'Get all reviews',
                    description: 'Retrieve a list of all reviews',
                    tags: ['Reviews'],
                    parameters: [
                        { in: 'query', name: 'provider_profile_id', schema: { type: 'string', format: 'uuid' }, description: 'Filter by provider ID' },
                        { in: 'query', name: 'rating', schema: { type: 'integer', minimum: 1, maximum: 5 }, description: 'Filter by rating' },
                        { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 }, description: 'Number of reviews to return' },
                        { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 }, description: 'Number of reviews to skip' }
                    ],
                    responses: {
                        '200': {
                            description: 'Reviews retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
                                            total: { type: 'integer' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '500': { description: 'Internal server error' }
                    }
                },
                post: {
                    summary: 'Create a new review',
                    description: 'Create a new review for a provider',
                    tags: ['Reviews'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['provider_profile_id', 'rating'],
                                    properties: {
                                        provider_profile_id: { type: 'string', format: 'uuid', description: 'Provider profile ID' },
                                        booking_id: { type: 'string', format: 'uuid', description: 'Booking ID (optional)' },
                                        rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating (1-5)' },
                                        comment: { type: 'string', description: 'Review comment' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'Review created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Review' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request' },
                        '401': { description: 'Unauthorized' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/reviews/{id}': {
                get: {
                    summary: 'Get review by ID',
                    description: 'Retrieve a specific review by ID',
                    tags: ['Reviews'],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'Review ID' }
                    ],
                    responses: {
                        '200': {
                            description: 'Review retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Review' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '404': { description: 'Review not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                put: {
                    summary: 'Update review',
                    description: 'Update review information',
                    tags: ['Reviews'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'Review ID' }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating (1-5)' },
                                        comment: { type: 'string', description: 'Review comment' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Review updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Review' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request' },
                        '401': { description: 'Unauthorized' },
                        '403': { description: 'Forbidden' },
                        '404': { description: 'Review not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                delete: {
                    summary: 'Delete review',
                    description: 'Delete a review',
                    tags: ['Reviews'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'Review ID' }
                    ],
                    responses: {
                        '200': {
                            description: 'Review deleted successfully',
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
                        '403': { description: 'Forbidden' },
                        '404': { description: 'Review not found' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/payments': {
                get: {
                    summary: 'Get all payments',
                    description: 'Retrieve a list of all payments (admin only)',
                    tags: ['Payments'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'query', name: 'status', schema: { type: 'string', enum: ['pending', 'succeeded', 'failed', 'cash'] }, description: 'Filter by payment status' },
                        { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 }, description: 'Number of payments to return' },
                        { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 }, description: 'Number of payments to skip' }
                    ],
                    responses: {
                        '200': {
                            description: 'Payments retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
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
                },
                post: {
                    summary: 'Create a new payment',
                    description: 'Create a new payment record',
                    tags: ['Payments'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['booking_id', 'amount', 'status', 'payment_method'],
                                    properties: {
                                        booking_id: { type: 'string', format: 'uuid', description: 'Booking ID' },
                                        amount: { type: 'number', minimum: 0, description: 'Payment amount' },
                                        currency: { type: 'string', default: 'NIO', description: 'Currency code' },
                                        status: { type: 'string', enum: ['pending', 'succeeded', 'failed', 'cash'], description: 'Payment status' },
                                        payment_method: { type: 'string', description: 'Payment method' },
                                        transaction_id: { type: 'string', description: 'Transaction ID' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'Payment created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Payment' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request' },
                        '401': { description: 'Unauthorized' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/payments/{id}': {
                get: {
                    summary: 'Get payment by ID',
                    description: 'Retrieve a specific payment by ID',
                    tags: ['Payments'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Payment ID' }
                    ],
                    responses: {
                        '200': {
                            description: 'Payment retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Payment' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized' },
                        '404': { description: 'Payment not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                put: {
                    summary: 'Update payment',
                    description: 'Update payment information',
                    tags: ['Payments'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Payment ID' }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', enum: ['pending', 'succeeded', 'failed', 'cash'], description: 'Payment status' },
                                        amount: { type: 'number', minimum: 0, description: 'Payment amount' },
                                        payment_method: { type: 'string', description: 'Payment method' },
                                        transaction_id: { type: 'string', description: 'Transaction ID' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Payment updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Payment' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request' },
                        '401': { description: 'Unauthorized' },
                        '404': { description: 'Payment not found' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/notifications': {
                get: {
                    summary: 'Get user notifications',
                    description: 'Retrieve notifications for the authenticated user',
                    tags: ['Notifications'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'query', name: 'is_read', schema: { type: 'boolean' }, description: 'Filter by read status' },
                        { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 }, description: 'Number of notifications to return' },
                        { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 }, description: 'Number of notifications to skip' }
                    ],
                    responses: {
                        '200': {
                            description: 'Notifications retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
                                            total: { type: 'integer' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized' },
                        '500': { description: 'Internal server error' }
                    }
                },
                post: {
                    summary: 'Create a new notification',
                    description: 'Create a new notification (admin only)',
                    tags: ['Notifications'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['user_id', 'title', 'message'],
                                    properties: {
                                        user_id: { type: 'string', format: 'uuid', description: 'User ID' },
                                        title: { type: 'string', description: 'Notification title' },
                                        message: { type: 'string', description: 'Notification message' },
                                        notification_type: { type: 'string', default: 'general', description: 'Notification type' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'Notification created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Notification' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request' },
                        '401': { description: 'Unauthorized' },
                        '403': { description: 'Forbidden - Admin access required' },
                        '500': { description: 'Internal server error' }
                    }
                }
            },
            '/api/notifications/{id}': {
                get: {
                    summary: 'Get notification by ID',
                    description: 'Retrieve a specific notification by ID',
                    tags: ['Notifications'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Notification ID' }
                    ],
                    responses: {
                        '200': {
                            description: 'Notification retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Notification' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized' },
                        '404': { description: 'Notification not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                put: {
                    summary: 'Update notification',
                    description: 'Update notification (mark as read)',
                    tags: ['Notifications'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Notification ID' }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        is_read: { type: 'boolean', description: 'Mark as read' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Notification updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Notification' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Bad request' },
                        '401': { description: 'Unauthorized' },
                        '404': { description: 'Notification not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                delete: {
                    summary: 'Delete notification',
                    description: 'Delete a notification',
                    tags: ['Notifications'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Notification ID' }
                    ],
                    responses: {
                        '200': {
                            description: 'Notification deleted successfully',
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
                        '404': { description: 'Notification not found' },
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
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'User unique identifier'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address'
                        },
                        role: {
                            type: 'string',
                            enum: ['provider', 'admin'],
                            description: 'User role'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User creation timestamp'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User last update timestamp'
                        }
                    },
                    required: ['id', 'email', 'role', 'created_at']
                },
                Service: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Service unique identifier'
                        },
                        title: {
                            type: 'string',
                            description: 'Service title'
                        },
                        description: {
                            type: 'string',
                            description: 'Service description'
                        },
                        price: {
                            type: 'number',
                            minimum: 0,
                            description: 'Service price'
                        },
                        category_id: {
                            type: 'integer',
                            description: 'Category ID'
                        },
                        provider_profile_id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Provider Profile ID'
                        },
                        location: {
                            type: 'string',
                            description: 'Service location'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Service creation timestamp'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Service last update timestamp'
                        }
                    },
                    required: ['id', 'title', 'description', 'price', 'category_id', 'provider_profile_id', 'created_at']
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Category ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Category name'
                        },
                        path_image: {
                            type: 'string',
                            description: 'Path to category image'
                        },
                        description: {
                            type: 'string',
                            description: 'Category description'
                        }
                    },
                    required: ['id', 'name', 'path_image']
                },
                Provider: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Provider unique identifier'
                        },
                        user_id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'User ID from auth.users'
                        },
                        provider_type: {
                            type: 'string',
                            enum: ['individual', 'company'],
                            description: 'Type of provider (individual or company)'
                        },
                        business_name: {
                            type: 'string',
                            description: 'Business or individual name'
                        },
                        description: {
                            type: 'string',
                            description: 'Provider description'
                        },
                        hourly_rate: {
                            type: 'number',
                            minimum: 0,
                            description: 'Hourly rate in USD'
                        },
                        photo_url: {
                            type: 'string',
                            description: 'Profile photo URL'
                        },
                        phone: {
                            type: 'string',
                            description: 'Contact phone number'
                        },
                        location: {
                            type: 'string',
                            description: 'Service location'
                        },
                        rating: {
                            type: 'number',
                            minimum: 0,
                            maximum: 5,
                            description: 'Average rating (0-5)'
                        },
                        total_reviews: {
                            type: 'integer',
                            minimum: 0,
                            description: 'Total number of reviews'
                        },
                        is_verified: {
                            type: 'boolean',
                            description: 'Whether the provider is verified'
                        },
                        is_active: {
                            type: 'boolean',
                            description: 'Whether the provider is active'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Provider creation timestamp'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Provider last update timestamp'
                        },
                        deleted_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Soft delete timestamp'
                        },
                        users: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    format: 'uuid'
                                },
                                email: {
                                    type: 'string',
                                    format: 'email'
                                },
                                role: {
                                    type: 'string',
                                    enum: ['provider', 'admin']
                                }
                            },
                            description: 'Associated user information'
                        },
                        provider_categories: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    category_id: {
                                        type: 'integer',
                                        description: 'Category ID'
                                    },
                                    categories: {
                                        type: 'object',
                                        properties: {
                                            id: {
                                                type: 'integer',
                                                description: 'Category ID'
                                            },
                                            name: {
                                                type: 'string',
                                                description: 'Category name'
                                            },
                                            path_imgage: {
                                                type: 'string',
                                                description: 'Category image path'
                                            },
                                            description: {
                                                type: 'string',
                                                description: 'Category description'
                                            }
                                        },
                                        description: 'Category information'
                                    }
                                }
                            },
                            description: 'Categories the provider specializes in'
                        }
                    },
                    required: ['id', 'user_id', 'provider_type', 'business_name', 'description', 'hourly_rate', 'created_at']
                },
                ProviderApplication: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        user_id: { type: 'string', format: 'uuid' },
                        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                        application_data: { type: 'object' },
                        rejection_reason: { type: 'string' },
                        submitted_at: { type: 'string', format: 'date-time' },
                        reviewed_at: { type: 'string', format: 'date-time' },
                        reviewed_by_admin_id: { type: 'string', format: 'uuid' }
                    },
                    required: ['id', 'user_id', 'status', 'application_data', 'submitted_at']
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
                description: 'User authentication and registration'
            },
            {
                name: 'Users',
                description: 'User management operations'
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
                name: 'Providers',
                description: 'Service provider management operations'
            },
            {
                name: 'ProviderApplications',
                description: 'Provider application management operations'
            },
            {
                name: 'Customer',
                description: 'Customer-specific operations'
            },
            {
                name: 'Contact',
                description: 'Contact platform support'
            }
        ]
    };

    return json(swaggerSpec);
}; 