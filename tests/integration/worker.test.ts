/**
 * Integration tests for the Cloudflare Worker
 *
 * Tests the complete request/response cycle through the worker's fetch handler
 */

import { describe, expect, it } from 'bun:test';
import worker from '../../src/index.js';
import type { Env } from '../../src/types/index.js';

/**
 * Create a mock ExecutionContext
 */
function createMockContext(): ExecutionContext {
  return {
    waitUntil: () => {},
    passThroughOnException: () => {},
    props: {},
  };
}

/**
 * Create environment with specified values
 */
function createEnv(environment: 'production' | 'staging' | 'development' = 'development'): Env {
  return { ENVIRONMENT: environment };
}

/**
 * Type guard for JSON responses
 */
interface ErrorResponse {
  error: string;
  message: string;
  stack?: string;
}

interface ApiInfoResponse {
  name: string;
  version: string;
  endpoints: Record<string, string>;
}

interface HealthResponse {
  status: string;
}

describe('Worker Integration Tests', () => {
  describe('Root endpoint /', () => {
    it('should return API info JSON', async () => {
      const request = new Request('https://techbadges.dev/');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const json = (await response.json()) as ApiInfoResponse;
      expect(json.name).toBe('TechBadges');
      expect(json.version).toBe('2.0.0');
      expect(json.endpoints).toBeDefined();
    });

    it('should include cache headers', async () => {
      const request = new Request('https://techbadges.dev/');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.headers.get('Cache-Control')).toContain('max-age=');
    });
  });

  describe('Icons endpoint /icons', () => {
    it('should generate SVG for valid icons', async () => {
      const request = new Request('https://techbadges.dev/icons?i=js,ts,react');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/svg+xml; charset=utf-8');

      const svg = await response.text();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should return 400 for missing icons parameter', async () => {
      const request = new Request('https://techbadges.dev/icons');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(400);
      const json = (await response.json()) as ErrorResponse;
      expect(json.error).toBe('VALIDATION_ERROR');
      expect(json.message).toContain("didn't specify any icons");
    });

    it('should support theme parameter', async () => {
      const darkRequest = new Request('https://techbadges.dev/icons?i=github&t=dark');
      const darkResponse = await worker.fetch(darkRequest, createEnv(), createMockContext());
      const darkSvg = await darkResponse.text();

      const lightRequest = new Request('https://techbadges.dev/icons?i=github&t=light');
      const lightResponse = await worker.fetch(lightRequest, createEnv(), createMockContext());
      const lightSvg = await lightResponse.text();

      expect(darkSvg).not.toBe(lightSvg);
    });

    it('should support perline parameter', async () => {
      const request = new Request(
        'https://techbadges.dev/icons?i=js,ts,react,vue,angular&perline=5'
      );
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(200);
      const svg = await response.text();
      // With 5 icons and perline=5, should be single row
      expect(svg).toContain('width="');
    });

    it('should handle ETag-based caching', async () => {
      const request1 = new Request('https://techbadges.dev/icons?i=js');
      const response1 = await worker.fetch(request1, createEnv(), createMockContext());
      const etag = response1.headers.get('ETag');
      expect(etag).toBeDefined();

      const request2 = new Request('https://techbadges.dev/icons?i=js', {
        headers: { 'If-None-Match': etag ?? '' },
      });
      const response2 = await worker.fetch(request2, createEnv(), createMockContext());

      expect(response2.status).toBe(304);
    });

    it('should skip invalid icons and use valid ones', async () => {
      const request = new Request('https://techbadges.dev/icons?i=js,invalidicon,ts');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(200);
    });

    it('should return 400 when all icons are invalid', async () => {
      const request = new Request('https://techbadges.dev/icons?i=invalid1,invalid2');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(400);
    });
  });

  describe('API endpoints', () => {
    it('GET /api/icons should return icon list', async () => {
      const request = new Request('https://techbadges.dev/api/icons');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/json');

      const json = (await response.json()) as string[];
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBeGreaterThan(0);
    });

    it('GET /api/svgs should return SVG map', async () => {
      const request = new Request('https://techbadges.dev/api/svgs');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/json');

      const json = (await response.json()) as Record<string, string>;
      expect(typeof json).toBe('object');
      expect(Object.keys(json).length).toBeGreaterThan(0);
    });
  });

  describe('Health endpoint /health', () => {
    it('should return health status', async () => {
      const request = new Request('https://techbadges.dev/health');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const json = (await response.json()) as HealthResponse;
      expect(json.status).toBe('ok');
    });
  });

  describe('CORS handling', () => {
    it('should handle OPTIONS preflight requests', async () => {
      const request = new Request('https://techbadges.dev/icons?i=js', {
        method: 'OPTIONS',
      });
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });

    it('should include CORS headers on regular requests', async () => {
      const request = new Request('https://techbadges.dev/icons?i=js');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const request = new Request('https://techbadges.dev/unknown');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(404);
      const json = (await response.json()) as ErrorResponse;
      expect(json.error).toBe('NOT_FOUND');
      expect(json.message).toContain('not found');
    });

    it('should return proper JSON error structure', async () => {
      const request = new Request('https://techbadges.dev/icons');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      const json = (await response.json()) as ErrorResponse;
      expect(json).toHaveProperty('error');
      expect(json).toHaveProperty('message');
      expect(typeof json.error).toBe('string');
    });

    it('should include stack trace in development mode', async () => {
      const request = new Request('https://techbadges.dev/icons');
      const response = await worker.fetch(request, createEnv('development'), createMockContext());

      const json = (await response.json()) as ErrorResponse;
      expect(json).toHaveProperty('stack');
    });

    it('should not include stack trace in production mode', async () => {
      const request = new Request('https://techbadges.dev/icons');
      const response = await worker.fetch(request, createEnv('production'), createMockContext());

      const json = (await response.json()) as ErrorResponse;
      expect(json).not.toHaveProperty('stack');
    });
  });

  describe('Input validation', () => {
    it('should reject invalid theme values', async () => {
      const request = new Request('https://techbadges.dev/icons?i=js&t=invalid');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(400);
    });

    it('should reject out-of-range perline values', async () => {
      const request = new Request('https://techbadges.dev/icons?i=js&perline=100');
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(400);
    });

    it('should enforce maximum icon limit', async () => {
      // Create request with 101 icons
      const icons = Array(101).fill('js').join(',');
      const request = new Request(`https://techbadges.dev/icons?i=${icons}`);
      const response = await worker.fetch(request, createEnv(), createMockContext());

      expect(response.status).toBe(400);
      const json = (await response.json()) as ErrorResponse;
      expect(json.error).toBe('VALIDATION_ERROR');
      expect(json.message).toContain('Maximum');
    });
  });

  describe('Icon aliases', () => {
    it('should resolve js to javascript', async () => {
      const jsRequest = new Request('https://techbadges.dev/icons?i=js');
      const jsResponse = await worker.fetch(jsRequest, createEnv(), createMockContext());
      const jsSvg = await jsResponse.text();

      const javascriptRequest = new Request('https://techbadges.dev/icons?i=javascript');
      const javascriptResponse = await worker.fetch(
        javascriptRequest,
        createEnv(),
        createMockContext()
      );
      const javascriptSvg = await javascriptResponse.text();

      expect(jsSvg).toBe(javascriptSvg);
    });

    it('should resolve ts to typescript', async () => {
      const tsRequest = new Request('https://techbadges.dev/icons?i=ts');
      const tsResponse = await worker.fetch(tsRequest, createEnv(), createMockContext());
      const tsSvg = await tsResponse.text();

      const typescriptRequest = new Request('https://techbadges.dev/icons?i=typescript');
      const typescriptResponse = await worker.fetch(
        typescriptRequest,
        createEnv(),
        createMockContext()
      );
      const typescriptSvg = await typescriptResponse.text();

      expect(tsSvg).toBe(typescriptSvg);
    });
  });
});
