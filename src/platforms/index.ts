/**
 * Platform abstraction layer
 *
 * Re-exports all platform adapters and types for easy consumption.
 */

export type { CloudflareEnv } from './cloudflare.js';

// Cloudflare
export { cloudflareAdapter, createCloudflareContext } from './cloudflare.js';
// Deno
export { createDenoContext, createDenoHandler, denoAdapter } from './deno.js';
// Types
export type {
  AnalyticsEvent,
  PlatformAdapter,
  PlatformAnalytics,
  PlatformCache,
  PlatformEnv,
  RequestContext,
} from './types.js';
export type { VercelEnv } from './vercel.js';
// Vercel
export { createVercelContext, createVercelHandler, vercelAdapter } from './vercel.js';
