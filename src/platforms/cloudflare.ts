/**
 * Cloudflare Workers platform adapter
 */

import type { PlatformAdapter, PlatformCache, PlatformEnv, RequestContext } from './types.js';

/**
 * Cloudflare-specific environment bindings
 */
export interface CloudflareEnv {
  ENVIRONMENT?: string;
  /** Cloudflare KV namespace for caching */
  ICON_CACHE?: KVNamespace;
}

/**
 * Cloudflare KV adapter implementing PlatformCache
 */
class CloudflareKVCache implements PlatformCache {
  constructor(private kv: KVNamespace) {}

  async get(key: string): Promise<string | null> {
    return this.kv.get(key);
  }

  async put(key: string, value: string, ttl?: number): Promise<void> {
    const options = ttl ? { expirationTtl: ttl } : undefined;
    await this.kv.put(key, value, options);
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }
}

/**
 * Create platform environment from Cloudflare bindings
 */
function createPlatformEnv(env: CloudflareEnv): PlatformEnv {
  return {
    environment: env.ENVIRONMENT ?? 'production',
    cache: env.ICON_CACHE ? new CloudflareKVCache(env.ICON_CACHE) : undefined,
  };
}

/**
 * Cloudflare Workers adapter
 */
export const cloudflareAdapter: PlatformAdapter = {
  platform: 'cloudflare',

  createContext(request: Request, env: CloudflareEnv, ctx: ExecutionContext): RequestContext {
    return {
      request,
      env: createPlatformEnv(env),
      waitUntil: ctx.waitUntil.bind(ctx),
    };
  },
};

/**
 * Type-safe helper to create Cloudflare context
 */
export function createCloudflareContext(
  request: Request,
  env: CloudflareEnv,
  ctx: ExecutionContext
): RequestContext {
  return cloudflareAdapter.createContext(request, env, ctx) as RequestContext;
}
