/**
 * Analytics hooks for tracking usage
 *
 * Non-blocking event tracking that uses platform-specific
 * mechanisms (like waitUntil) to send events after response.
 */

import type { AnalyticsEvent, PlatformAnalytics, RequestContext } from '../platforms/types.js';

/**
 * Event types for icon requests
 */
export type IconEventType =
  | 'icon_request'
  | 'icon_cache_hit'
  | 'icon_cache_miss'
  | 'icon_error'
  | 'api_request';

/**
 * Icon request event properties
 */
export interface IconRequestProperties {
  /** Number of icons requested */
  iconCount: number;
  /** Icons requested (comma-separated, truncated) */
  icons: string;
  /** Theme used */
  theme: string;
  /** Icons per line */
  perLine: number;
  /** Response time in ms */
  responseTime?: number;
  /** Whether response was cached */
  cached?: boolean;
}

/**
 * Create an analytics event for icon requests
 */
export function createIconRequestEvent(
  type: IconEventType,
  properties: Partial<IconRequestProperties>
): AnalyticsEvent {
  return {
    name: type,
    properties: {
      iconCount: properties.iconCount ?? 0,
      // Truncate icons list to avoid huge payloads
      icons: (properties.icons ?? '').slice(0, 200),
      theme: properties.theme ?? 'dark',
      perLine: properties.perLine ?? 15,
      ...(properties.responseTime !== undefined && { responseTime: properties.responseTime }),
      ...(properties.cached !== undefined && { cached: properties.cached }),
    },
    timestamp: new Date(),
  };
}

/**
 * Analytics tracker that uses waitUntil for non-blocking sends
 */
export class AnalyticsTracker {
  private analytics: PlatformAnalytics | undefined;
  private waitUntil: ((promise: Promise<unknown>) => void) | undefined;
  private queue: AnalyticsEvent[] = [];

  constructor(ctx: RequestContext) {
    this.analytics = ctx.env.analytics;
    this.waitUntil = ctx.waitUntil;
  }

  /**
   * Track an event (non-blocking)
   */
  track(event: AnalyticsEvent): void {
    if (!this.analytics) {
      // No analytics configured, skip
      return;
    }

    // Queue the event
    this.queue.push(event);
  }

  /**
   * Track an icon request event
   */
  trackIconRequest(properties: Partial<IconRequestProperties>): void {
    this.track(createIconRequestEvent('icon_request', properties));
  }

  /**
   * Track a cache hit
   */
  trackCacheHit(properties: Partial<IconRequestProperties>): void {
    this.track(createIconRequestEvent('icon_cache_hit', properties));
  }

  /**
   * Track a cache miss
   */
  trackCacheMiss(properties: Partial<IconRequestProperties>): void {
    this.track(createIconRequestEvent('icon_cache_miss', properties));
  }

  /**
   * Track an error
   */
  trackError(error: Error, properties?: Partial<IconRequestProperties>): void {
    this.track({
      name: 'icon_error',
      properties: {
        errorName: error.name,
        errorMessage: error.message.slice(0, 200),
        ...properties,
      },
      timestamp: new Date(),
    });
  }

  /**
   * Flush all queued events
   * Call this after sending the response
   */
  flush(): void {
    if (!this.analytics || this.queue.length === 0) {
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    // Send events
    const sendEvents = async () => {
      for (const event of events) {
        try {
          this.analytics?.track(event);
        } catch (error) {
          // Silently ignore analytics errors
          console.error('Analytics error:', error);
        }
      }
    };

    // Use waitUntil if available to not block response
    if (this.waitUntil) {
      this.waitUntil(sendEvents());
    } else {
      // Fire and forget
      sendEvents().catch(() => {
        // Ignore
      });
    }
  }
}

/**
 * Create an analytics tracker for a request context
 */
export function createAnalyticsTracker(ctx: RequestContext): AnalyticsTracker {
  return new AnalyticsTracker(ctx);
}

/**
 * No-op analytics tracker for when analytics is disabled
 */
export const noopTracker = {
  track: () => {},
  trackIconRequest: () => {},
  trackCacheHit: () => {},
  trackCacheMiss: () => {},
  trackError: () => {},
  flush: () => {},
};
