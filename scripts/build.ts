/**
 * Build script for TechBadges
 *
 * Reads SVG icons from /icons directory and generates:
 * - dist/icons.json: Icon name -> SVG content mapping
 * - dist/metadata.json: Icon metadata for API
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALIASES } from '../src/config/aliases.js';
import { getIconCategory, type IconCategory } from '../src/config/categories.js';

interface IconMetadata {
  id: string;
  name: string;
  hasTheme: boolean;
  aliases: string[];
  size: number;
  category: IconCategory;
}

interface BuildStats {
  totalIcons: number;
  themedPairs: number;
  standaloneIcons: number;
  totalSize: number;
  averageSize: number;
  largestIcon: { name: string; size: number };
  errors: string[];
  warnings: string[];
}

const ICONS_DIR = './icons';
const DIST_DIR = './dist';

/**
 * Main build function
 */
async function build(): Promise<void> {
  console.log('Building TechBadges...\n');

  // Ensure dist directory exists
  if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR, { recursive: true });
  }

  // Read all SVG files
  const files = readdirSync(ICONS_DIR).filter(f => f.endsWith('.svg'));

  if (files.length === 0) {
    console.error('No SVG files found in icons directory!');
    process.exit(1);
  }

  const icons: Record<string, string> = {};
  const metadata: IconMetadata[] = [];
  const stats: BuildStats = {
    totalIcons: 0,
    themedPairs: 0,
    standaloneIcons: 0,
    totalSize: 0,
    averageSize: 0,
    largestIcon: { name: '', size: 0 },
    errors: [],
    warnings: [],
  };

  // Track themed icons for pair detection
  const themedBases = new Set<string>();

  // Process each icon file
  for (const file of files) {
    const filePath = join(ICONS_DIR, file);
    const stat = statSync(filePath);
    const content = readFileSync(filePath, 'utf-8');

    // Check for empty files
    if (stat.size === 0 || content.trim() === '') {
      stats.errors.push(`${file}: File is empty`);
      continue;
    }

    // Check for valid SVG structure
    if (!content.includes('<svg') || !content.includes('</svg>')) {
      stats.errors.push(`${file}: Invalid SVG structure`);
      continue;
    }

    // Warn on large files
    if (stat.size > 50 * 1024) {
      stats.warnings.push(
        `${file}: File is ${(stat.size / 1024).toFixed(1)}KB (recommended < 50KB)`
      );
    }

    // Convert filename to key (lowercase, no extension)
    const name = file.replace('.svg', '').toLowerCase();
    icons[name] = content;

    // Track stats
    stats.totalIcons++;
    stats.totalSize += stat.size;

    if (stat.size > stats.largestIcon.size) {
      stats.largestIcon = { name: file, size: stat.size };
    }

    // Detect themed icons
    if (name.includes('-dark') || name.includes('-light')) {
      const baseName = name.replace(/-(dark|light)$/, '');
      themedBases.add(baseName);
    }
  }

  // Generate metadata for unique icons (base names)
  const processedBases = new Set<string>();

  for (const name of Object.keys(icons)) {
    const baseName = name.replace(/-(dark|light)$/, '');

    if (processedBases.has(baseName)) {
      continue;
    }
    processedBases.add(baseName);

    const hasTheme = themedBases.has(baseName);
    const iconKey = hasTheme ? `${baseName}-dark` : baseName;
    const iconContent = icons[iconKey];
    const size = iconContent ? Buffer.byteLength(iconContent, 'utf-8') : 0;

    // Find aliases for this icon
    const aliases = Object.entries(ALIASES)
      .filter(([, target]) => target === baseName)
      .map(([alias]) => alias);

    metadata.push({
      id: baseName,
      name: formatIconName(baseName),
      hasTheme,
      aliases,
      size,
      category: getIconCategory(baseName),
    });

    if (hasTheme) {
      stats.themedPairs++;
    } else {
      stats.standaloneIcons++;
    }
  }

  // Calculate average size
  stats.averageSize = Math.round(stats.totalSize / stats.totalIcons);

  // Validate alias targets
  for (const [alias, target] of Object.entries(ALIASES)) {
    const targetDark = `${target}-dark`;
    if (!icons[target] && !icons[targetDark]) {
      stats.warnings.push(`Alias '${alias}' points to non-existent icon '${target}'`);
    }
  }

  // Check for unpaired themed icons
  for (const baseName of themedBases) {
    const hasDark = icons[`${baseName}-dark`];
    const hasLight = icons[`${baseName}-light`];

    if (hasDark && !hasLight) {
      stats.warnings.push(`${baseName}: Has -dark variant but missing -light`);
    } else if (!hasDark && hasLight) {
      stats.warnings.push(`${baseName}: Has -light variant but missing -dark`);
    }
  }

  // Write output files
  writeFileSync(join(DIST_DIR, 'icons.json'), JSON.stringify(icons));
  writeFileSync(join(DIST_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2));

  // Print results
  console.log('Build Stats:');
  console.log(`  Total icons: ${stats.totalIcons}`);
  console.log(`  Themed pairs: ${stats.themedPairs}`);
  console.log(`  Standalone: ${stats.standaloneIcons}`);
  console.log(`  Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  Average size: ${(stats.averageSize / 1024).toFixed(1)}KB`);
  console.log(
    `  Largest: ${stats.largestIcon.name} (${(stats.largestIcon.size / 1024).toFixed(1)}KB)`
  );

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    for (const e of stats.errors) {
      console.log(`  ✗ ${e}`);
    }
  }

  if (stats.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const w of stats.warnings) {
      console.log(`  ⚠ ${w}`);
    }
  }

  // Exit with error if there were validation errors
  if (stats.errors.length > 0) {
    console.log('\nBuild failed due to errors.');
    process.exit(1);
  }

  console.log('\nBuild complete!');
  console.log(`  → ${DIST_DIR}/icons.json`);
  console.log(`  → ${DIST_DIR}/metadata.json`);
}

/**
 * Format icon base name to display name
 */
function formatIconName(baseName: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    nodejs: 'Node.js',
    vuejs: 'Vue.js',
    nuxtjs: 'Nuxt.js',
    nextjs: 'Next.js',
    nestjs: 'NestJS',
    expressjs: 'Express.js',
    dotnet: '.NET',
    cpp: 'C++',
    cs: 'C#',
    mongodb: 'MongoDB',
    postgresql: 'PostgreSQL',
    mysql: 'MySQL',
    graphql: 'GraphQL',
    github: 'GitHub',
    gitlab: 'GitLab',
    vscode: 'VS Code',
    webassembly: 'WebAssembly',
  };

  if (specialCases[baseName]) {
    return specialCases[baseName];
  }

  // Default: capitalize first letter
  return baseName.charAt(0).toUpperCase() + baseName.slice(1);
}

// Run build
build().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
