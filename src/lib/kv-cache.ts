/**
 * KV-based caching layer for generated SVGs
 *
 * Caches generated SVG responses by a hash of the request parameters
 * to reduce computation for repeated requests.
 */

import type { PlatformCache } from '../platforms/types.js';

/** Cache TTL for generated SVGs (1 day in seconds) */
const SVG_CACHE_TTL = 86400;

/** Cache key prefix */
const CACHE_PREFIX = 'svg:';

/**
 * Generate a cache key from request parameters
 */
export function generateCacheKey(params: {
  icons: string;
  theme?: string;
  perLine?: number;
}): string {
  const normalized = {
    i: params.icons.toLowerCase().split(',').sort().join(','),
    t: params.theme ?? 'dark',
    p: params.perLine ?? 15,
  };

  // Simple hash of the parameters
  const str = JSON.stringify(normalized);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return `${CACHE_PREFIX}${Math.abs(hash).toString(36)}`;
}

/**
 * KV cache wrapper for SVG responses
 */
export class SvgCache {
  constructor(private cache: PlatformCache) {}

  /**
   * Get cached SVG if available
   */
  async get(params: { icons: string; theme?: string; perLine?: number }): Promise<string | null> {
    const key = generateCacheKey(params);
    try {
      return await this.cache.get(key);
    } catch (error) {
      // Log but don't fail on cache errors
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Store SVG in cache
   */
  async set(
    params: {
      icons: string;
      theme?: string;
      perLine?: number;
    },
    svg: string
  ): Promise<void> {
    const key = generateCacheKey(params);
    try {
      await this.cache.put(key, svg, SVG_CACHE_TTL);
    } catch (error) {
      // Log but don't fail on cache errors
      console.error('Cache set error:', error);
    }
  }

  /**
   * Invalidate a cached SVG
   */
  async invalidate(params: { icons: string; theme?: string; perLine?: number }): Promise<void> {
    const key = generateCacheKey(params);
    try {
      await this.cache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
}

/**
 * Create an SvgCache instance if cache is available
 */
export function createSvgCache(cache: PlatformCache | undefined): SvgCache | null {
  return cache ? new SvgCache(cache) : null;
}

/**
 * Helper to wrap icon generation with caching
 *
 * Usage:
 * ```ts
 * const svg = await withCache(svgCache, params, () => generateSvg(...));
 * ```
 */
export async function withCache<T>(
  cache: SvgCache | null,
  params: { icons: string; theme?: string; perLine?: number },
  generate: () => T
): Promise<T> {
  // If no cache, just generate
  if (!cache) {
    return generate();
  }

  // Try cache first
  const cached = await cache.get(params);
  if (cached !== null) {
    return cached as T;
  }

  // Generate and cache
  const result = generate();

  // Cache in background (don't await)
  if (typeof result === 'string') {
    cache.set(params, result).catch(() => {
      // Ignore cache errors
    });
  }

  return result;
}
