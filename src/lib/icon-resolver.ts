/**
 * Icon name resolution and validation
 */

import { resolveAlias } from '../config/aliases.js';
import { ICON_NAME_PATTERN, MAX_ICONS_PER_REQUEST } from '../config/constants.js';
import type { Theme } from '../types/index.js';
import { ValidationError } from './errors.js';

/**
 * Validate and resolve icon names from user input
 *
 * @param iconParam - Comma-separated list of icon names
 * @param theme - Theme to apply (dark/light)
 * @param availableIcons - Set of all available icon keys
 * @param themedIcons - Set of icon base names that have themed variants
 * @returns Array of resolved icon keys
 */
export function resolveIconNames(
  iconParam: string,
  theme: Theme | undefined,
  availableIcons: Set<string>,
  themedIcons: Set<string>
): string[] {
  const requestedIcons = iconParam
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0);

  if (requestedIcons.length === 0) {
    throw new ValidationError("You didn't specify any icons!");
  }

  if (requestedIcons.length > MAX_ICONS_PER_REQUEST) {
    throw new ValidationError(`Maximum ${MAX_ICONS_PER_REQUEST} icons allowed per request`);
  }

  const resolved: string[] = [];
  const effectiveTheme = theme ?? 'dark';

  for (const name of requestedIcons) {
    // Validate icon name format (security: prevent injection)
    if (!ICON_NAME_PATTERN.test(name)) {
      // Skip invalid names silently (matches original behavior)
      continue;
    }

    // Resolve alias to canonical name
    const baseName = resolveAlias(name);

    // Check if this icon has themed variants
    if (themedIcons.has(baseName)) {
      const themedName = `${baseName}-${effectiveTheme}`;
      if (availableIcons.has(themedName)) {
        resolved.push(themedName);
      }
    } else if (availableIcons.has(baseName)) {
      // Non-themed icon
      resolved.push(baseName);
    }
    // Unknown icons are silently skipped (matches original behavior)
  }

  return resolved;
}

/**
 * Build sets of available and themed icons from the icon registry
 *
 * @param iconKeys - All icon keys from the registry
 * @returns Object with availableIcons and themedIcons sets
 */
export function buildIconSets(iconKeys: string[]): {
  availableIcons: Set<string>;
  themedIcons: Set<string>;
  iconNameList: string[];
} {
  const availableIcons = new Set(iconKeys);
  const themedIcons = new Set<string>();

  // Detect themed icons by looking for -dark or -light suffixes
  for (const key of iconKeys) {
    if (key.includes('-dark') || key.includes('-light')) {
      const baseName = key.replace(/-(dark|light)$/, '');
      themedIcons.add(baseName);
    }
  }

  // Build unique icon name list (base names only)
  const iconNameList = [...new Set(iconKeys.map(key => key.replace(/-(dark|light)$/, '')))];

  return { availableIcons, themedIcons, iconNameList };
}

/**
 * Validate theme parameter
 *
 * @param theme - Theme value from query parameter
 * @returns Validated theme or undefined
 */
export function validateTheme(theme: string | null): Theme | undefined {
  if (theme === null) {
    return undefined;
  }

  if (theme === 'dark' || theme === 'light') {
    return theme;
  }

  throw new ValidationError('Theme must be either "light" or "dark"');
}

/**
 * Validate and parse perLine parameter
 *
 * @param perLineParam - perLine value from query parameter
 * @param defaultValue - Default value if not provided
 * @returns Validated perLine number
 */
export function validatePerLine(perLineParam: string | null, defaultValue: number): number {
  if (perLineParam === null) {
    return defaultValue;
  }

  const perLine = Number.parseInt(perLineParam, 10);

  if (Number.isNaN(perLine) || perLine < 1 || perLine > 50) {
    throw new ValidationError('Icons per line must be a number between 1 and 50');
  }

  return perLine;
}
