/**
 * SVG grid generation
 */

import { GRID_CELL, GRID_GAP, SCALE } from '../config/constants.js';

/**
 * Format icon name for display (remove theme suffix, format nicely)
 */
function formatDisplayName(iconName: string): string {
  // Remove theme suffix (-dark, -light)
  const baseName = iconName.replace(/-(dark|light)$/i, '');

  // Special cases for common names
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
    openai: 'OpenAI',
    pytorch: 'PyTorch',
    tensorflow: 'TensorFlow',
    aws: 'AWS',
    gcp: 'GCP',
    dbt: 'dbt',
    airflow: 'Airflow',
    powershell: 'PowerShell',
    linkedin: 'LinkedIn',
    stackoverflow: 'Stack Overflow',
    huggingface: 'Hugging Face',
    langchain: 'LangChain',
  };

  if (specialCases[baseName]) {
    return specialCases[baseName];
  }

  // Default: capitalize first letter
  return baseName.charAt(0).toUpperCase() + baseName.slice(1);
}

/**
 * Generate an SVG grid containing multiple icons
 *
 * @param iconNames - Array of icon keys to include
 * @param icons - Icon registry (key -> SVG content)
 * @param perLine - Number of icons per line
 * @returns Complete SVG string
 */
export function generateSvg(
  iconNames: string[],
  icons: Record<string, string>,
  perLine: number
): string {
  const iconCount = iconNames.length;

  if (iconCount === 0) {
    // Return empty SVG
    return '<svg width="0" height="0" xmlns="http://www.w3.org/2000/svg"></svg>';
  }

  // Calculate dimensions
  const columns = Math.min(perLine, iconCount);
  const rows = Math.ceil(iconCount / perLine);

  const length = columns * GRID_CELL - GRID_GAP;
  const height = rows * GRID_CELL - GRID_GAP;

  const scaledWidth = length * SCALE;
  const scaledHeight = height * SCALE;

  // Pre-allocate parts array for better performance
  const parts: string[] = new Array(iconCount + 2);

  // Opening SVG tag
  parts[0] = `<svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${length} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" version="1.1">`;

  // Generate icon groups
  for (let i = 0; i < iconCount; i++) {
    const iconName = iconNames[i];
    if (!iconName) {
      parts[i + 1] = '';
      continue;
    }
    const iconSvg = icons[iconName];

    if (!iconSvg) {
      // Skip missing icons
      parts[i + 1] = '';
      continue;
    }

    const x = (i % perLine) * GRID_CELL;
    const y = Math.floor(i / perLine) * GRID_CELL;
    const displayName = formatDisplayName(iconName);

    parts[i + 1] =
      `<g transform="translate(${x},${y})"><title>${displayName}</title>${iconSvg}</g>`;
  }

  // Closing SVG tag
  parts[iconCount + 1] = '</svg>';

  return parts.join('');
}

/**
 * Extract the inner content from an SVG string (without the outer <svg> tags)
 * Useful for embedding SVGs within other SVGs
 *
 * @param svg - Complete SVG string
 * @returns Inner content without svg wrapper
 */
export function extractSvgContent(svg: string): string {
  // Remove opening svg tag
  const withoutOpen = svg.replace(/<svg[^>]*>/, '');
  // Remove closing svg tag
  return withoutOpen.replace(/<\/svg>/, '');
}
