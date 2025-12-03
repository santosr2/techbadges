/**
 * Platform abstraction layer
 *
 * Re-exports all platform adapters and types for easy consumption.
 */

// Types
export type {
  AnalyticsEvent,
  PlatformAdapter,
  PlatformAnalytics,
  PlatformCache,
  PlatformEnv,
  RequestContext,
} from './types.js';

// Cloudflare
export { cloudflareAdapter, createCloudflareContext } from './cloudflare.js';
export type { CloudflareEnv } from './cloudflare.js';

// Vercel
export { createVercelContext, createVercelHandler, vercelAdapter } from './vercel.js';
export type { VercelEnv } from './vercel.js';

// Deno
export { createDenoContext, createDenoHandler, denoAdapter } from './deno.js';
