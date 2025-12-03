/**
 * Icon validation script
 *
 * Validates all icons in the icons directory for:
 * - File integrity (non-empty, valid SVG)
 * - Dimension requirements (256x256)
 * - Size limits
 * - Naming conventions
 * - Theme pair completeness
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ValidationError, ValidationResult, ValidationStats } from '../src/types/index.js';

const ICONS_DIR = './icons';
const MAX_FILE_SIZE = 50 * 1024; // 50KB
const EXPECTED_DIMENSIONS = { width: 256, height: 256 };

/**
 * Known large icons that cannot be optimized further
 * These icons have complex vector artwork that requires their size
 */
const KNOWN_LARGE_ICONS = new Set([
  'Plan9-Dark.svg',
  'Plan9-Light.svg',
  'Emotion-Dark.svg',
  'Emotion-Light.svg',
]);

/**
 * Validate all icons and return results
 */
export function validateIcons(iconsDir: string = ICONS_DIR): ValidationResult {
  const errors: ValidationError[] = [];
  const files = readdirSync(iconsDir).filter(f => f.endsWith('.svg'));

  let totalSize = 0;
  let largestIcon = { name: '', size: 0 };
  const themedBases = new Map<string, { dark: boolean; light: boolean }>();

  for (const file of files) {
    const filePath = join(iconsDir, file);
    const stat = statSync(filePath);

    // Check file size
    totalSize += stat.size;

    if (stat.size > largestIcon.size) {
      largestIcon = { name: file, size: stat.size };
    }

    // Check for empty files
    if (stat.size === 0) {
      errors.push({ file, error: 'File is empty (0 bytes)', severity: 'error' });
      continue;
    }

    const content = readFileSync(filePath, 'utf-8');

    // Check for valid SVG structure
    if (!content.includes('<svg') || !content.includes('</svg>')) {
      errors.push({ file, error: 'Invalid SVG structure - missing <svg> tags', severity: 'error' });
      continue;
    }

    // Check for empty content
    if (content.trim().length === 0) {
      errors.push({ file, error: 'File contains only whitespace', severity: 'error' });
      continue;
    }

    // Check dimensions
    const widthMatch = content.match(/width="(\d+)"/);
    const heightMatch = content.match(/height="(\d+)"/);

    if (widthMatch?.[1] && heightMatch?.[1]) {
      const width = Number.parseInt(widthMatch[1], 10);
      const height = Number.parseInt(heightMatch[1], 10);

      if (width !== EXPECTED_DIMENSIONS.width || height !== EXPECTED_DIMENSIONS.height) {
        errors.push({
          file,
          error: `Dimensions ${width}x${height} (expected ${EXPECTED_DIMENSIONS.width}x${EXPECTED_DIMENSIONS.height})`,
          severity: 'warning',
        });
      }
    } else {
      errors.push({
        file,
        error: 'Missing width/height attributes',
        severity: 'warning',
      });
    }

    // Check viewBox
    if (!content.includes('viewBox=')) {
      errors.push({
        file,
        error: 'Missing viewBox attribute',
        severity: 'warning',
      });
    }

    // Check file size (skip warning for known large icons)
    if (stat.size > MAX_FILE_SIZE && !KNOWN_LARGE_ICONS.has(file)) {
      errors.push({
        file,
        error: `File size ${(stat.size / 1024).toFixed(1)}KB exceeds ${MAX_FILE_SIZE / 1024}KB limit`,
        severity: 'warning',
      });
    }

    // Check for prohibited elements
    const prohibitedPatterns = [
      { pattern: /<script/i, name: 'script elements' },
      // Only flag external http/https URLs, not embedded data: URIs
      { pattern: /<image[^>]+xlink:href\s*=\s*["']https?:/i, name: 'external images' },
      { pattern: /<image[^>]+href\s*=\s*["']https?:/i, name: 'external images' },
      { pattern: /javascript:/i, name: 'javascript: URLs' },
      { pattern: /<foreignObject/i, name: 'foreignObject elements' },
    ];

    for (const { pattern, name } of prohibitedPatterns) {
      if (pattern.test(content)) {
        errors.push({
          file,
          error: `Contains prohibited ${name}`,
          severity: 'error',
        });
      }
    }

    // Track themed icons
    const baseName = file.replace('.svg', '').toLowerCase();
    if (baseName.includes('-dark') || baseName.includes('-light')) {
      const base = baseName.replace(/-(dark|light)$/, '');
      const existing = themedBases.get(base) ?? { dark: false, light: false };

      if (baseName.endsWith('-dark')) {
        existing.dark = true;
      } else if (baseName.endsWith('-light')) {
        existing.light = true;
      }

      themedBases.set(base, existing);
    }
  }

  // Check for unpaired themed icons
  for (const [base, { dark, light }] of themedBases) {
    if (dark && !light) {
      errors.push({
        file: `${base}-*.svg`,
        error: 'Has -Dark variant but missing -Light',
        severity: 'warning',
      });
    } else if (!dark && light) {
      errors.push({
        file: `${base}-*.svg`,
        error: 'Has -Light variant but missing -Dark',
        severity: 'warning',
      });
    }
  }

  // Calculate stats
  const themedPairs = [...themedBases.values()].filter(v => v.dark && v.light).length;
  const standaloneIcons = files.length - themedBases.size * 2 + themedBases.size;

  const stats: ValidationStats = {
    totalIcons: files.length,
    themedPairs,
    standaloneIcons: Math.max(0, standaloneIcons),
    totalSize,
    averageSize: Math.round(totalSize / files.length),
    largestIcon,
  };

  const hasErrors = errors.some(e => e.severity === 'error');

  return {
    valid: !hasErrors,
    errors,
    stats,
  };
}

/**
 * CLI entry point
 */
function main(): void {
  console.log('Validating icons...\n');

  const result = validateIcons();

  console.log('Validation Stats:');
  console.log(`  Total icons: ${result.stats.totalIcons}`);
  console.log(`  Themed pairs: ${result.stats.themedPairs}`);
  console.log(`  Standalone: ${result.stats.standaloneIcons}`);
  console.log(`  Total size: ${(result.stats.totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  Average size: ${(result.stats.averageSize / 1024).toFixed(1)}KB`);
  console.log(
    `  Largest: ${result.stats.largestIcon.name} (${(result.stats.largestIcon.size / 1024).toFixed(1)}KB)`
  );

  const errorList = result.errors.filter(e => e.severity === 'error');
  const warningList = result.errors.filter(e => e.severity === 'warning');

  if (errorList.length > 0) {
    console.log('\nErrors:');
    for (const e of errorList) {
      console.log(`  ✗ ${e.file}: ${e.error}`);
    }
  }

  if (warningList.length > 0) {
    console.log('\nWarnings:');
    for (const w of warningList) {
      console.log(`  ⚠ ${w.file}: ${w.error}`);
    }
  }

  if (result.valid) {
    console.log('\n✓ All icons are valid');
  } else {
    console.log('\n✗ Validation failed');
    process.exit(1);
  }
}

// Run if called directly
main();
