/**
 * SVG Optimization script using SVGO
 *
 * Optimizes all SVG files in the icons directory to reduce file size.
 *
 * Usage:
 *   bun run scripts/optimize-icons.ts          # Optimize all icons
 *   bun run scripts/optimize-icons.ts --dry-run # Preview without modifying
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Config } from 'svgo';
import { optimize } from 'svgo';

const ICONS_DIR = './icons';
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * SVGO configuration for aggressive icon optimization
 */
const svgoConfig: Config = {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Keep viewBox for proper scaling
          removeViewBox: false,
          // Clean up numeric values
          cleanupNumericValues: {
            floatPrecision: 2,
          },
        },
      },
    },
    // Remove unnecessary attributes
    {
      name: 'removeAttrs',
      params: {
        attrs: ['data-.*', 'class', 'style'],
      },
    },
    // Sort attributes for consistency and better compression
    'sortAttrs',
    // Clean up IDs
    'cleanupIds',
    // Remove unused namespaces
    'removeUnusedNS',
    // Convert colors to shorter format
    'convertColors',
    // Round/rewrite transforms
    'convertTransform',
  ],
};

interface OptimizationResult {
  name: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
  skipped: boolean;
}

/**
 * Optimize a single SVG file
 */
function optimizeSvg(filePath: string): OptimizationResult | null {
  const name = filePath.split('/').pop() ?? filePath;

  try {
    const original = readFileSync(filePath, 'utf-8');
    const originalSize = Buffer.byteLength(original, 'utf-8');

    // Skip empty files
    if (originalSize === 0) {
      console.warn(`  ⚠ Skipping empty file: ${name}`);
      return null;
    }

    const result = optimize(original, { ...svgoConfig, path: filePath });
    const optimizedSize = Buffer.byteLength(result.data, 'utf-8');

    const savings = originalSize - optimizedSize;
    const savingsPercent = originalSize > 0 ? (savings / originalSize) * 100 : 0;

    // Only write if there's actual savings and not dry run
    const skipped = optimizedSize >= originalSize;
    if (!skipped && !DRY_RUN) {
      writeFileSync(filePath, result.data);
    }

    return {
      name,
      originalSize,
      optimizedSize: skipped ? originalSize : optimizedSize,
      savings: skipped ? 0 : savings,
      savingsPercent: skipped ? 0 : savingsPercent,
      skipped,
    };
  } catch (error) {
    console.error(`  ✗ Failed to optimize ${name}:`, error);
    return null;
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

/**
 * Optimize all icons in the directory
 */
async function optimizeAll(): Promise<void> {
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Optimizing SVG icons...\n`);

  const files = readdirSync(ICONS_DIR).filter(f => f.endsWith('.svg'));
  const results: OptimizationResult[] = [];

  let totalOriginal = 0;
  let totalOptimized = 0;
  let skippedCount = 0;

  for (const file of files) {
    const filePath = join(ICONS_DIR, file);
    const result = optimizeSvg(filePath);

    if (result) {
      results.push(result);
      totalOriginal += result.originalSize;
      totalOptimized += result.optimizedSize;
      if (result.skipped) skippedCount++;
    }
  }

  // Sort by savings (largest first)
  const optimized = results.filter(r => !r.skipped && r.savings > 0);
  optimized.sort((a, b) => b.savings - a.savings);

  // Print top optimizations
  if (optimized.length > 0) {
    console.log('Top Optimizations:');
    optimized.slice(0, 15).forEach((r, i) => {
      console.log(
        `  ${String(i + 1).padStart(2)}. ${r.name.padEnd(30)} ${formatBytes(r.originalSize).padStart(8)} → ${formatBytes(r.optimizedSize).padStart(8)} (${r.savingsPercent.toFixed(1)}% saved)`
      );
    });
  }

  // Print summary
  const totalSavings = totalOriginal - totalOptimized;
  const totalSavingsPercent = totalOriginal > 0 ? (totalSavings / totalOriginal) * 100 : 0;

  console.log('\n─────────────────────────────────────────');
  console.log('Summary:');
  console.log(`  Files processed:  ${results.length}`);
  console.log(`  Files optimized:  ${optimized.length}`);
  console.log(`  Files skipped:    ${skippedCount} (already optimal)`);
  console.log(`  Original total:   ${formatBytes(totalOriginal)}`);
  console.log(`  Optimized total:  ${formatBytes(totalOptimized)}`);
  console.log(
    `  Total savings:    ${formatBytes(totalSavings)} (${totalSavingsPercent.toFixed(1)}%)`
  );

  // Warn about files that are still large
  const largeFiles = results.filter(r => r.optimizedSize > 50 * 1024);
  if (largeFiles.length > 0) {
    console.log('\n⚠ Files still over 50KB (may need manual optimization):');
    largeFiles
      .sort((a, b) => b.optimizedSize - a.optimizedSize)
      .forEach(r => {
        console.log(`  • ${r.name}: ${formatBytes(r.optimizedSize)}`);
      });
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] No files were modified. Run without --dry-run to apply changes.');
  } else {
    console.log('\n✓ Optimization complete!');
  }
}

// Run optimization
optimizeAll().catch(error => {
  console.error('Optimization failed:', error);
  process.exit(1);
});
