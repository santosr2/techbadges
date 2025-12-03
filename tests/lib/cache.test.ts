import { describe, expect, it } from 'bun:test';
import {
  createCachedIconResponse,
  createCachedJsonResponse,
  createCacheHeaders,
  createCorsPreflightResponse,
  generateETag,
  getCacheControlHeader,
  hasMatchingETag,
} from '../../src/lib/cache.js';

describe('getCacheControlHeader', () => {
  it('should generate basic cache control header', () => {
    const header = getCacheControlHeader({ maxAge: 3600 });
    expect(header).toBe('public, max-age=3600');
  });

  it('should include stale-while-revalidate when specified', () => {
    const header = getCacheControlHeader({ maxAge: 3600, staleWhileRevalidate: 86400 });
    expect(header).toBe('public, max-age=3600, stale-while-revalidate=86400');
  });

  it('should include immutable when specified', () => {
    const header = getCacheControlHeader({ maxAge: 31536000, isImmutable: true });
    expect(header).toBe('public, max-age=31536000, immutable');
  });
});

describe('generateETag', () => {
  it('should generate consistent ETag for same content', () => {
    const content = '<svg>test</svg>';
    const etag1 = generateETag(content);
    const etag2 = generateETag(content);
    expect(etag1).toBe(etag2);
  });

  it('should generate different ETags for different content', () => {
    const etag1 = generateETag('<svg>test1</svg>');
    const etag2 = generateETag('<svg>test2</svg>');
    expect(etag1).not.toBe(etag2);
  });

  it('should return quoted string', () => {
    const etag = generateETag('test');
    expect(etag).toMatch(/^"[a-f0-9]+"$/);
  });
});

describe('hasMatchingETag', () => {
  it('should return true for matching ETag', () => {
    const etag = '"abc123"';
    const request = new Request('https://example.com', {
      headers: { 'If-None-Match': etag },
    });
    expect(hasMatchingETag(request, etag)).toBe(true);
  });

  it('should return false for non-matching ETag', () => {
    const request = new Request('https://example.com', {
      headers: { 'If-None-Match': '"different"' },
    });
    expect(hasMatchingETag(request, '"abc123"')).toBe(false);
  });

  it('should return false when no If-None-Match header', () => {
    const request = new Request('https://example.com');
    expect(hasMatchingETag(request, '"abc123"')).toBe(false);
  });
});

describe('createCacheHeaders', () => {
  it('should set Content-Type header', () => {
    const headers = createCacheHeaders('image/svg+xml', { maxAge: 3600 });
    expect(headers.get('Content-Type')).toBe('image/svg+xml');
  });

  it('should set Cache-Control header', () => {
    const headers = createCacheHeaders('application/json', { maxAge: 3600 });
    expect(headers.get('Cache-Control')).toBe('public, max-age=3600');
  });

  it('should set Vary header', () => {
    const headers = createCacheHeaders('text/html', { maxAge: 3600 });
    expect(headers.get('Vary')).toBe('Accept-Encoding');
  });

  it('should set ETag when provided', () => {
    const headers = createCacheHeaders('text/html', { maxAge: 3600 }, '"test-etag"');
    expect(headers.get('ETag')).toBe('"test-etag"');
  });
});

describe('createCachedIconResponse', () => {
  it('should return 200 response with SVG content', () => {
    const svg = '<svg>test</svg>';
    const request = new Request('https://example.com');
    const response = createCachedIconResponse(svg, request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml; charset=utf-8');
  });

  it('should return 304 for matching ETag', async () => {
    const svg = '<svg>test</svg>';
    const etag = generateETag(svg);
    const request = new Request('https://example.com', {
      headers: { 'If-None-Match': etag },
    });
    const response = createCachedIconResponse(svg, request);

    expect(response.status).toBe(304);
    expect(await response.text()).toBe('');
  });

  it('should include CORS headers', () => {
    const svg = '<svg>test</svg>';
    const request = new Request('https://example.com');
    const response = createCachedIconResponse(svg, request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});

describe('createCachedJsonResponse', () => {
  it('should return JSON response', async () => {
    const data = { test: true };
    const response = createCachedJsonResponse(data);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    const body = (await response.json()) as { test: boolean };
    expect(body.test).toBe(true);
  });

  it('should include CORS headers', () => {
    const response = createCachedJsonResponse({ test: true });

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
  });

  it('should return 304 for matching ETag when request provided', () => {
    const data = { test: true };
    const etag = generateETag(JSON.stringify(data));
    const request = new Request('https://example.com', {
      headers: { 'If-None-Match': etag },
    });
    const response = createCachedJsonResponse(data, undefined, request);

    expect(response.status).toBe(304);
  });
});

describe('createCorsPreflightResponse', () => {
  it('should return 204 status', () => {
    const response = createCorsPreflightResponse();
    expect(response.status).toBe(204);
  });

  it('should include all CORS headers', () => {
    const response = createCorsPreflightResponse();

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
      'Content-Type, If-None-Match'
    );
    expect(response.headers.get('Access-Control-Max-Age')).toBe('86400');
  });
});
