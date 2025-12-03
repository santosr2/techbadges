import { describe, expect, it } from 'bun:test';
import {
  AppError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  createErrorResponse,
} from '../../src/lib/errors.js';

describe('AppError', () => {
  it('should create error with default values', () => {
    const error = new AppError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.name).toBe('AppError');
  });

  it('should create error with custom values', () => {
    const error = new AppError('Custom error', 418, 'TEAPOT');
    expect(error.message).toBe('Custom error');
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEAPOT');
  });

  it('should be instance of Error', () => {
    const error = new AppError('Test');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('ValidationError', () => {
  it('should create validation error', () => {
    const error = new ValidationError('Invalid input');
    expect(error.message).toBe('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('ValidationError');
  });

  it('should be instance of AppError', () => {
    const error = new ValidationError('Test');
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('NotFoundError', () => {
  it('should create not found error with default message', () => {
    const error = new NotFoundError();
    expect(error.message).toBe('Not Found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.name).toBe('NotFoundError');
  });

  it('should create not found error with custom message', () => {
    const error = new NotFoundError('Resource not found');
    expect(error.message).toBe('Resource not found');
  });
});

describe('RateLimitError', () => {
  it('should create rate limit error', () => {
    const error = new RateLimitError();
    expect(error.message).toBe('Too Many Requests');
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(error.name).toBe('RateLimitError');
  });
});

interface ErrorResponseBody {
  error: string;
  message: string;
  stack?: string;
}

describe('createErrorResponse', () => {
  it('should create response from AppError', async () => {
    const error = new ValidationError('Bad input');
    const response = createErrorResponse(error);

    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Cache-Control')).toBe('no-store');

    const body = (await response.json()) as ErrorResponseBody;
    expect(body.error).toBe('VALIDATION_ERROR');
    expect(body.message).toBe('Bad input');
    expect(body.stack).toBeUndefined();
  });

  it('should include stack trace in dev mode', async () => {
    const error = new ValidationError('Bad input');
    const response = createErrorResponse(error, true);
    const body = (await response.json()) as ErrorResponseBody;

    expect(body.stack).toBeDefined();
  });

  it('should handle unknown errors', async () => {
    const error = new Error('Unknown error');
    const response = createErrorResponse(error);

    expect(response.status).toBe(500);
    const body = (await response.json()) as ErrorResponseBody;
    expect(body.error).toBe('INTERNAL_ERROR');
    expect(body.message).toBe('An unexpected error occurred');
  });

  it('should expose error message in dev mode for unknown errors', async () => {
    const error = new Error('Debug info');
    const response = createErrorResponse(error, true);
    const body = (await response.json()) as ErrorResponseBody;

    expect(body.message).toBe('Debug info');
    expect(body.stack).toBeDefined();
  });

  it('should handle non-Error objects', async () => {
    const response = createErrorResponse('string error');

    expect(response.status).toBe(500);
    const body = (await response.json()) as ErrorResponseBody;
    expect(body.error).toBe('INTERNAL_ERROR');
    expect(body.message).toBe('An unexpected error occurred');
  });

  it('should create NotFoundError response', async () => {
    const error = new NotFoundError('Page not found');
    const response = createErrorResponse(error);

    expect(response.status).toBe(404);
    const body = (await response.json()) as ErrorResponseBody;
    expect(body.error).toBe('NOT_FOUND');
    expect(body.message).toBe('Page not found');
  });

  it('should create RateLimitError response', async () => {
    const error = new RateLimitError();
    const response = createErrorResponse(error);

    expect(response.status).toBe(429);
    const body = (await response.json()) as ErrorResponseBody;
    expect(body.error).toBe('RATE_LIMIT_EXCEEDED');
  });
});
