/**
 * HTTP caching utilities
 */

import { CACHE_CONFIG } from '../config/constants.js';
import type { CacheConfig } from '../types/index.js';

/**
 * Generate Cache-Control header value from config
 */
export function getCacheControlHeader(config: CacheConfig): string {
  const parts = ['public', `max-age=${config.maxAge}`];

  if (config.staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  if (config.isImmutable) {
    parts.push('immutable');
  }

  return parts.join(', ');
}

/**
 * Generate an ETag from content using a simple hash
 */
export function generateETag(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(16)}"`;
}

/**
 * Check if the request has a matching ETag (conditional request)
 */
export function hasMatchingETag(request: Request, etag: string): boolean {
  const ifNoneMatch = request.headers.get('If-None-Match');
  return ifNoneMatch === etag;
}

/**
 * Create response headers with caching configuration
 */
export function createCacheHeaders(
  contentType: string,
  config: CacheConfig,
  etag?: string
): Headers {
  const headers = new Headers();

  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', getCacheControlHeader(config));
  headers.set('Vary', 'Accept-Encoding');

  if (etag) {
    headers.set('ETag', etag);
  }

  return headers;
}

/**
 * Create a cached response for icons endpoint
 */
export function createCachedIconResponse(svg: string, request: Request): Response {
  const etag = generateETag(svg);

  // Check for conditional request
  if (hasMatchingETag(request, etag)) {
    return new Response(null, { status: 304 });
  }

  const headers = createCacheHeaders('image/svg+xml; charset=utf-8', CACHE_CONFIG.icons, etag);

  // Add CORS headers
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(svg, { headers });
}

/**
 * Create CORS preflight response
 */
export function createCorsPreflightResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Create a cached JSON response with optional ETag support
 */
export function createCachedJsonResponse(
  data: unknown,
  config: CacheConfig = CACHE_CONFIG.apiIcons,
  request?: Request
): Response {
  const body = JSON.stringify(data);
  const etag = generateETag(body);

  // Check for conditional request
  if (request && hasMatchingETag(request, etag)) {
    return new Response(null, { status: 304 });
  }

  const headers = createCacheHeaders('application/json; charset=utf-8', config, etag);

  // Add CORS headers for API endpoints
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Max-Age', '86400');

  return new Response(body, { headers });
}
