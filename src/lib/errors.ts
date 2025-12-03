/**
 * Custom error classes for structured error handling
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Validation error for invalid user input
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too Many Requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

/**
 * Error response structure
 */
interface ErrorResponse {
  error: string;
  message: string;
  stack?: string;
}

/**
 * Create a standardized error response
 *
 * @param error - The error that occurred
 * @param isDev - Whether to include debug information
 * @returns Response object with appropriate status and body
 */
export function createErrorResponse(error: unknown, isDev = false): Response {
  // Handle known application errors
  if (error instanceof AppError) {
    const body: ErrorResponse = {
      error: error.code,
      message: error.message,
    };

    if (isDev && error.stack) {
      body.stack = error.stack;
    }

    return new Response(JSON.stringify(body), {
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }

  // Handle unknown errors - never expose details in production
  if (error instanceof Error) {
    console.error('Unexpected error:', error.message, error.stack);
  } else {
    console.error('Unexpected error:', error);
  }

  const body: ErrorResponse = {
    error: 'INTERNAL_ERROR',
    message: isDev && error instanceof Error ? error.message : 'An unexpected error occurred',
  };

  if (isDev && error instanceof Error && error.stack) {
    body.stack = error.stack;
  }

  return new Response(JSON.stringify(body), {
    status: 500,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
