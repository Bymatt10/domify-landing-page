// ===========================
// EXCEPTION HANDLING SYSTEM
// ===========================

// Custom Exception Classes
export class DomifyException extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationException extends DomifyException {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationException extends DomifyException {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
  }
}

export class AuthorizationException extends DomifyException {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}

export class NotFoundException extends DomifyException {
  constructor(resource: string = 'Resource', details?: any) {
    super(`${resource} not found`, 404, 'NOT_FOUND', details);
  }
}

export class ConflictException extends DomifyException {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class DatabaseException extends DomifyException {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

export class SupabaseException extends DomifyException {
  constructor(message: string = 'Supabase operation failed', details?: any) {
    super(message, 500, 'SUPABASE_ERROR', details);
  }
}

// Error Response Interface
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: any;
    timestamp: string;
  };
}

// Success Response Interface
export interface SuccessResponse<T = any> {
  data?: T;
  message: string;
  statusCode: number;
  timestamp: string;
}

// Exception Handler Class
export class ExceptionHandler {
  /**
   * Handle any error and return a standardized error response
   */
  static handle(error: any): ErrorResponse {
    console.error('Exception caught:', error);

    // If it's already a DomifyException, use it directly
    if (error instanceof DomifyException) {
      return this.createErrorResponse(error);
    }

    // Handle Supabase errors
    if (error?.code && error?.message) {
      return this.handleSupabaseError(error);
    }

    // Handle validation errors
    if (error?.name === 'ValidationError') {
      return this.createErrorResponse(
        new ValidationException(error.message, error.details)
      );
    }

    // Handle database errors
    if (error?.code?.startsWith('23')) {
      return this.createErrorResponse(
        new DatabaseException('Database constraint violation', error)
      );
    }

    // Handle network/connection errors
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      return this.createErrorResponse(
        new DomifyException('Service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE', error)
      );
    }

    // Default error
    return this.createErrorResponse(
      new DomifyException(
        error?.message || 'An unexpected error occurred',
        500,
        'INTERNAL_ERROR',
        error
      )
    );
  }

  /**
   * Handle Supabase-specific errors
   */
  static handleSupabaseError(error: any): ErrorResponse {
    const { code, message, details } = error;

    switch (code) {
      case 'PGRST116':
        return this.createErrorResponse(
          new NotFoundException('Resource not found', details)
        );
      
      case '23505':
        return this.createErrorResponse(
          new ConflictException('Resource already exists', details)
        );
      
      case '23502':
        return this.createErrorResponse(
          new ValidationException('Required field missing', details)
        );
      
      case '23503':
        return this.createErrorResponse(
          new ValidationException('Referenced resource does not exist', details)
        );
      
      case '42P01':
        return this.createErrorResponse(
          new DatabaseException('Table does not exist', details)
        );
      
      case '42703':
        return this.createErrorResponse(
          new DatabaseException('Column does not exist', details)
        );
      
      default:
        return this.createErrorResponse(
          new SupabaseException(message, details)
        );
    }
  }

  /**
   * Create a standardized error response
   */
  static createErrorResponse(exception: DomifyException): ErrorResponse {
    return {
      error: {
        message: exception.message,
        code: exception.code,
        statusCode: exception.statusCode,
        details: exception.details,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Create a standardized success response
   */
  static createSuccessResponse<T>(
    data: T,
    message: string = 'Operation completed successfully',
    statusCode: number = 200
  ): SuccessResponse<T> {
    return {
      data,
      message,
      statusCode,
      timestamp: new Date().toISOString()
    };
  }
}

// Helper functions for common operations
export const handleAsync = async <T>(
  operation: () => Promise<T>,
  successMessage?: string
): Promise<{ success: true; data: T } | { success: false; error: ErrorResponse }> => {
  try {
    const result = await operation();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: ExceptionHandler.handle(error)
    };
  }
};

// Validation helpers
export const validateRequired = (value: any, fieldName: string): void => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new ValidationException(`${fieldName} is required`);
  }
};

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationException('Invalid email format');
  }
};

export const validatePassword = (password: string): void => {
  if (password.length < 6) {
    throw new ValidationException('Password must be at least 6 characters long');
  }
};

// Auth-specific helpers
export const handleAuthError = (error: any): ErrorResponse => {
  if (error?.message?.includes('Invalid login credentials')) {
    return ExceptionHandler.createErrorResponse(
      new AuthenticationException('Invalid email or password')
    );
  }

  if (error?.message?.includes('Email not confirmed') || 
      error?.message?.includes('email') ||
      error?.message?.includes('confirmation')) {
    return ExceptionHandler.createErrorResponse(
      new AuthenticationException('Please confirm your email before signing in', { 
        needsConfirmation: true 
      })
    );
  }

  if (error?.message?.includes('User already registered')) {
    return ExceptionHandler.createErrorResponse(
      new ConflictException('User already exists')
    );
  }

  return ExceptionHandler.handle(error);
}; 