/**
 * Vercel Edge Functions platform adapter
 */

import type { PlatformAdapter, PlatformEnv, RequestContext } from './types.js';

/**
 * Vercel-specific environment
 */
export interface VercelEnv {
  VERCEL_ENV?: string;
}

/**
 * Create platform environment from Vercel env vars
 */
function createPlatformEnv(): PlatformEnv {
  return {
    environment: process.env.VERCEL_ENV ?? 'production',
    // Vercel doesn't have built-in KV, could integrate with Vercel KV or Redis
    cache: undefined,
  };
}

/**
 * Vercel Edge Functions adapter
 */
export const vercelAdapter: PlatformAdapter = {
  platform: 'vercel',

  createContext(request: Request): RequestContext {
    return {
      request,
      env: createPlatformEnv(),
      // Vercel Edge doesn't have waitUntil in the same way
      waitUntil: undefined,
    };
  },
};

/**
 * Type-safe helper to create Vercel context
 */
export function createVercelContext(request: Request): RequestContext {
  return vercelAdapter.createContext(request) as RequestContext;
}

/**
 * Vercel Edge handler export helper
 *
 * Usage in api/icons.ts:
 * ```ts
 * import { createVercelHandler } from '../src/platforms/vercel.js';
 * import { handleRequest } from '../src/core/handler.js';
 *
 * export const config = { runtime: 'edge' };
 * export default createVercelHandler(handleRequest);
 * ```
 */
export function createVercelHandler(
  handler: (ctx: RequestContext) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const ctx = createVercelContext(request);
    return handler(ctx);
  };
}
