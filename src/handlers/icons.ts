/**
 * Handler for /icons endpoint
 */

import icons from '../../dist/icons.json' with { type: 'json' };
import { ICONS_PER_LINE } from '../config/constants.js';
import { createCachedIconResponse } from '../lib/cache.js';
import { ValidationError } from '../lib/errors.js';
import {
  buildIconSets,
  resolveIconNames,
  validatePerLine,
  validateTheme,
} from '../lib/icon-resolver.js';
import { generateSvg } from '../lib/svg-generator.js';

// Build icon sets once at startup
const { availableIcons, themedIcons } = buildIconSets(Object.keys(icons));

/**
 * Handle requests to the /icons endpoint
 *
 * Query parameters:
 * - i or icons: Comma-separated list of icon names (required)
 * - t or theme: "dark" or "light" (optional, default: dark)
 * - perline: Number of icons per line, 1-50 (optional, default: 15)
 *
 * @param request - The incoming request
 * @param searchParams - URL search parameters
 * @returns Response with SVG image
 */
export function handleIcons(request: Request, searchParams: URLSearchParams): Response {
  // Get icon parameter
  const iconParam = searchParams.get('i') ?? searchParams.get('icons');

  if (!iconParam) {
    throw new ValidationError("You didn't specify any icons!");
  }

  // Special case: "all" returns all icons
  const effectiveIconParam =
    iconParam === 'all'
      ? [...availableIcons].filter(name => !name.includes('-light')).join(',')
      : iconParam;

  // Validate and get theme
  const themeParam = searchParams.get('t') ?? searchParams.get('theme');
  const theme = validateTheme(themeParam);

  // Validate and get perLine
  const perLineParam = searchParams.get('perline');
  const perLine = validatePerLine(perLineParam, ICONS_PER_LINE);

  // Resolve icon names
  const iconNames = resolveIconNames(effectiveIconParam, theme, availableIcons, themedIcons);

  if (iconNames.length === 0) {
    throw new ValidationError('No valid icons found for the specified names');
  }

  // Generate SVG
  const svg = generateSvg(iconNames, icons as Record<string, string>, perLine);

  // Return cached response
  return createCachedIconResponse(svg, request);
}
