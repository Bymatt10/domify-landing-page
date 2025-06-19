import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    const swaggerSpec = {
        openapi: '3.0.0',
        info: {
            title: 'Domify API',
            description: 'API documentation for Domify marketplace platform. This documentation is publicly available. Use the login endpoint to get a valid JWT token for protected endpoints.',
            version: '1.0.0',
            contact: {
                name: 'Domify Support',
                email: 'support@domify.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5173',
                description: 'Development server'
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
                                            status: {
                                                type: 'string',
                                                example: 'ok'
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time'
                                            },
                                            version: {
                                                type: 'string',
                                                example: '1.0.0'
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Domify API is running!'
                                            }
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
                                            enum: ['provider', 'admin'],
                                            default: 'provider',
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
                                            message: {
                                                type: 'string',
                                                example: 'User created successfully'
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
                            description: "User's unique identifier"
                        }
                    ],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'User retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/User' }
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
                            description: "User's unique identifier"
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        email: {
                                            type: 'string',
                                            format: 'email',
                                            description: "User's email address"
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
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'User updated successfully',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/User' }
                                }
                            }
                        },
                        '401': { description: 'Unauthorized - No token provided' },
                        '403': { description: 'Forbidden - Invalid or expired token' },
                        '400': { description: 'Bad request - validation error' },
                        '404': { description: 'User not found' },
                        '500': { description: 'Internal server error' }
                    }
                },
                delete: {
                    summary: 'Delete user',
                    description: 'Soft delete a user (mark as deleted)',
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
                            description: "User's unique identifier"
                        }
                    ],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': { description: 'User deleted successfully' },
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
                            name: 'provider_id',
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
                        provider_id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Provider ID'
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
                    required: ['id', 'title', 'description', 'price', 'category_id', 'provider_id', 'created_at']
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
            }
        ]
    };

    return json(swaggerSpec);
}; 