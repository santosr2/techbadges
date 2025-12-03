/**
 * Platform abstraction types
 *
 * These types allow the core logic to work across different serverless platforms
 * (Cloudflare Workers, Vercel Edge, Deno Deploy, etc.)
 */

/**
 * Platform-agnostic environment configuration
 */
export interface PlatformEnv {
  /** Environment name (development, staging, production) */
  environment: string;
  /** Optional KV/cache namespace for caching */
  cache?: PlatformCache | undefined;
  /** Optional analytics/logging service */
  analytics?: PlatformAnalytics | undefined;
}

/**
 * Platform-agnostic cache interface
 */
export interface PlatformCache {
  /** Get a cached value by key */
  get(key: string): Promise<string | null>;
  /** Set a cached value with optional TTL in seconds */
  put(key: string, value: string, ttl?: number): Promise<void>;
  /** Delete a cached value */
  delete(key: string): Promise<void>;
}

/**
 * Platform-agnostic analytics interface
 */
export interface PlatformAnalytics {
  /** Track an event (non-blocking) */
  track(event: AnalyticsEvent): void;
}

/**
 * Analytics event structure
 */
export interface AnalyticsEvent {
  /** Event name */
  name: string;
  /** Event properties */
  properties?: Record<string, string | number | boolean>;
  /** Timestamp (defaults to now) */
  timestamp?: Date;
}

/**
 * Platform-agnostic request context
 */
export interface RequestContext {
  /** The incoming request */
  request: Request;
  /** Platform environment */
  env: PlatformEnv;
  /** Execute async work after response (platform-specific) */
  waitUntil?: ((promise: Promise<unknown>) => void) | undefined;
}

/**
 * Platform adapter interface
 */
export interface PlatformAdapter {
  /** Platform identifier */
  readonly platform: 'cloudflare' | 'vercel' | 'deno' | 'node';
  /** Create a request context from platform-specific inputs */
  createContext(...args: unknown[]): RequestContext;
}
