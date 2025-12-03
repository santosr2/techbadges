/**
 * Deno Deploy platform adapter
 */

import type { PlatformAdapter, PlatformEnv, RequestContext } from './types.js';

/**
 * Create platform environment for Deno
 */
function createPlatformEnv(): PlatformEnv {
  // Deno.env is available in Deno runtime
  const getEnv = (key: string): string | undefined => {
    try {
      // @ts-expect-error - Deno global not available in Node/Bun
      return Deno.env.get(key);
    } catch {
      return undefined;
    }
  };

  return {
    environment: getEnv('DENO_ENV') ?? 'production',
    // Deno KV could be integrated here
    cache: undefined,
  };
}

/**
 * Deno Deploy adapter
 */
export const denoAdapter: PlatformAdapter = {
  platform: 'deno',

  createContext(request: Request): RequestContext {
    return {
      request,
      env: createPlatformEnv(),
      // Deno Deploy doesn't have waitUntil
      waitUntil: undefined,
    };
  },
};

/**
 * Type-safe helper to create Deno context
 */
export function createDenoContext(request: Request): RequestContext {
  return denoAdapter.createContext(request) as RequestContext;
}

/**
 * Deno Deploy handler helper
 *
 * Usage in main.ts:
 * ```ts
 * import { createDenoHandler } from './src/platforms/deno.ts';
 * import { handleRequest } from './src/core/handler.ts';
 *
 * Deno.serve(createDenoHandler(handleRequest));
 * ```
 */
export function createDenoHandler(
  handler: (ctx: RequestContext) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const ctx = createDenoContext(request);
    return handler(ctx);
  };
}
