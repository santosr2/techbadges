/**
 * Application constants
 */

/** Default number of icons per line in the grid */
export const ICONS_PER_LINE = 15;

/** Minimum icons per line allowed */
export const MIN_ICONS_PER_LINE = 1;

/** Maximum icons per line allowed */
export const MAX_ICONS_PER_LINE = 50;

/** Maximum total icons per request */
export const MAX_ICONS_PER_REQUEST = 100;

/** Size of one icon in the grid (pixels) */
export const ONE_ICON = 48;

/** Grid cell size (source SVG units) */
export const GRID_CELL = 300;

/** Grid gap adjustment */
export const GRID_GAP = 44;

/** Scale factor for output */
export const SCALE = ONE_ICON / (GRID_CELL - GRID_GAP);

/** Valid icon name pattern (alphanumeric and hyphens) */
export const ICON_NAME_PATTERN = /^[a-z0-9-]+$/;

/** Cache configuration */
export const CACHE_CONFIG = {
  icons: {
    maxAge: 86400, // 1 day
    staleWhileRevalidate: 604800, // 1 week
  },
  apiIcons: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 1 day
  },
  apiSvgs: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 1 day
  },
} as const;
