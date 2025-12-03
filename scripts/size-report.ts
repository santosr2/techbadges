/**
 * Size Report Generator
 *
 * Generates a markdown report comparing icon sizes before and after optimization.
 * Useful for PR comments and tracking optimization progress.
 *
 * Usage:
 *   bun run scripts/size-report.ts                    # Generate report to stdout
 *   bun run scripts/size-report.ts --output report.md # Save to file
 *   bun run scripts/size-report.ts --json             # Output as JSON
 */

import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ICONS_DIR = './icons';

interface IconSize {
  name: string;
  size: number;
}

interface SizeReport {
  generatedAt: string;
  totalFiles: number;
  totalSize: number;
  averageSize: number;
  largestIcons: IconSize[];
  smallestIcons: IconSize[];
  sizeDistribution: {
    under5KB: number;
    under10KB: number;
    under25KB: number;
    under50KB: number;
    over50KB: number;
  };
  oversizedIcons: IconSize[];
}

/**
 * Collect size data for all icons
 */
function collectIconSizes(iconsDir: string = ICONS_DIR): IconSize[] {
  const files = readdirSync(iconsDir).filter(f => f.endsWith('.svg'));
  const sizes: IconSize[] = [];

  for (const file of files) {
    const filePath = join(iconsDir, file);
    const stat = statSync(filePath);
    sizes.push({ name: file, size: stat.size });
  }

  return sizes.sort((a, b) => b.size - a.size);
}

/**
 * Generate size report
 */
function generateReport(sizes: IconSize[]): SizeReport {
  const totalSize = sizes.reduce((sum, icon) => sum + icon.size, 0);

  const distribution = {
    under5KB: 0,
    under10KB: 0,
    under25KB: 0,
    under50KB: 0,
    over50KB: 0,
  };

  for (const icon of sizes) {
    const kb = icon.size / 1024;
    if (kb < 5) distribution.under5KB++;
    else if (kb < 10) distribution.under10KB++;
    else if (kb < 25) distribution.under25KB++;
    else if (kb < 50) distribution.under50KB++;
    else distribution.over50KB++;
  }

  return {
    generatedAt: new Date().toISOString(),
    totalFiles: sizes.length,
    totalSize,
    averageSize: Math.round(totalSize / sizes.length),
    largestIcons: sizes.slice(0, 10),
    smallestIcons: sizes.slice(-10).reverse(),
    sizeDistribution: distribution,
    oversizedIcons: sizes.filter(icon => icon.size > 50 * 1024),
  };
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Generate markdown report
 */
function toMarkdown(report: SizeReport): string {
  const lines: string[] = [];

  lines.push('# Icon Size Report');
  lines.push('');
  lines.push(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Total Icons | ${report.totalFiles} |`);
  lines.push(`| Total Size | ${formatBytes(report.totalSize)} |`);
  lines.push(`| Average Size | ${formatBytes(report.averageSize)} |`);
  lines.push('');

  // Distribution
  lines.push('## Size Distribution');
  lines.push('');
  lines.push('| Range | Count | Percentage |');
  lines.push('|-------|-------|------------|');

  const distEntries = [
    ['< 5 KB', report.sizeDistribution.under5KB],
    ['5-10 KB', report.sizeDistribution.under10KB],
    ['10-25 KB', report.sizeDistribution.under25KB],
    ['25-50 KB', report.sizeDistribution.under50KB],
    ['> 50 KB', report.sizeDistribution.over50KB],
  ] as const;

  for (const [range, count] of distEntries) {
    const pct = ((count / report.totalFiles) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round((count / report.totalFiles) * 20));
    lines.push(`| ${range} | ${count} | ${bar} ${pct}% |`);
  }
  lines.push('');

  // Largest icons
  lines.push('## Largest Icons');
  lines.push('');
  lines.push('| Rank | Icon | Size |');
  lines.push('|------|------|------|');

  report.largestIcons.forEach((icon, i) => {
    const warning = icon.size > 50 * 1024 ? ' ⚠️' : '';
    lines.push(`| ${i + 1} | ${icon.name}${warning} | ${formatBytes(icon.size)} |`);
  });
  lines.push('');

  // Oversized warning
  if (report.oversizedIcons.length > 0) {
    lines.push('## ⚠️ Oversized Icons (> 50 KB)');
    lines.push('');
    lines.push('These icons may need manual optimization:');
    lines.push('');
    for (const icon of report.oversizedIcons) {
      lines.push(`- **${icon.name}**: ${formatBytes(icon.size)}`);
    }
    lines.push('');
  }

  // Smallest icons
  lines.push('## Smallest Icons');
  lines.push('');
  lines.push('| Rank | Icon | Size |');
  lines.push('|------|------|------|');

  report.smallestIcons.forEach((icon, i) => {
    lines.push(`| ${i + 1} | ${icon.name} | ${formatBytes(icon.size)} |`);
  });
  lines.push('');

  return lines.join('\n');
}

/**
 * Main CLI entry point
 */
function main(): void {
  const args = process.argv.slice(2);
  const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;
  const jsonOutput = args.includes('--json');

  const sizes = collectIconSizes();
  const report = generateReport(sizes);

  if (jsonOutput) {
    const json = JSON.stringify(report, null, 2);
    if (outputFile) {
      writeFileSync(outputFile, json);
      console.log(`JSON report saved to ${outputFile}`);
    } else {
      console.log(json);
    }
  } else {
    const markdown = toMarkdown(report);
    if (outputFile) {
      writeFileSync(outputFile, markdown);
      console.log(`Report saved to ${outputFile}`);
    } else {
      console.log(markdown);
    }
  }
}

main();
