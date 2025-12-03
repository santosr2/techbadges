/**
 * Handlers for /api/* endpoints
 */

import icons from '../../dist/icons.json' with { type: 'json' };
import { CACHE_CONFIG } from '../config/constants.js';
import { createCachedJsonResponse } from '../lib/cache.js';
import { buildIconSets } from '../lib/icon-resolver.js';

// Build icon name list once at startup
const { iconNameList } = buildIconSets(Object.keys(icons));

/**
 * Handle GET /api/icons
 *
 * Returns a JSON array of all available icon names (base names only, no theme suffixes)
 */
export function handleApiIcons(): Response {
  return createCachedJsonResponse(iconNameList, CACHE_CONFIG.apiIcons);
}

/**
 * Handle GET /api/svgs
 *
 * Returns a JSON object with all icon SVGs keyed by their name
 */
export function handleApiSvgs(): Response {
  return createCachedJsonResponse(icons, CACHE_CONFIG.apiSvgs);
}
