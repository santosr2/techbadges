/**
 * Type definitions for TechBadges
 */

/**
 * Environment bindings for Cloudflare Workers
 */
export interface Env {
  ENVIRONMENT: 'production' | 'staging' | 'development';
  ICON_CACHE?: KVNamespace;
}

/**
 * Theme options for icons
 */
export type Theme = 'dark' | 'light';

/**
 * Icon metadata stored in the registry
 */
export interface IconMetadata {
  id: string;
  name: string;
  hasTheme: boolean;
  aliases: string[];
  size: number;
  category?: string;
}

/**
 * Result of icon validation
 */
export interface ValidationError {
  file: string;
  error: string;
  severity: 'error' | 'warning';
}

/**
 * Validation statistics
 */
export interface ValidationStats {
  totalIcons: number;
  themedPairs: number;
  standaloneIcons: number;
  totalSize: number;
  averageSize: number;
  largestIcon: {
    name: string;
    size: number;
  };
}

/**
 * Complete validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  stats: ValidationStats;
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  maxAge: number;
  staleWhileRevalidate?: number;
  isImmutable?: boolean;
}

/**
 * Icon resolution options
 */
export interface IconResolverOptions {
  theme?: Theme;
  maxIcons?: number;
}

/**
 * SVG generation options
 */
export interface SvgGeneratorOptions {
  perLine: number;
  iconSize?: number;
  gap?: number;
}
