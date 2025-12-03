import { describe, expect, it } from 'bun:test';
import { extractSvgContent, generateSvg } from '../../src/lib/svg-generator.js';

describe('generateSvg', () => {
  const mockIcons: Record<string, string> = {
    javascript: '<rect width="256" height="256" fill="#F7DF1E"/>',
    typescript: '<rect width="256" height="256" fill="#3178C6"/>',
    react: '<circle cx="128" cy="128" r="50" fill="#61DAFB"/>',
  };

  it('should generate SVG with single icon', () => {
    const svg = generateSvg(['javascript'], mockIcons, 15);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('F7DF1E');
    expect(svg).toContain('transform="translate(0,0)"');
  });

  it('should generate SVG with multiple icons', () => {
    const svg = generateSvg(['javascript', 'typescript', 'react'], mockIcons, 15);

    expect(svg).toContain('F7DF1E');
    expect(svg).toContain('3178C6');
    expect(svg).toContain('61DAFB');
  });

  it('should respect perLine parameter', () => {
    const svg = generateSvg(['javascript', 'typescript', 'react'], mockIcons, 2);

    // First row: 0,0 and 300,0
    expect(svg).toContain('translate(0,0)');
    expect(svg).toContain('translate(300,0)');
    // Second row: 0,300
    expect(svg).toContain('translate(0,300)');
  });

  it('should return empty SVG for empty icon list', () => {
    const svg = generateSvg([], mockIcons, 15);

    expect(svg).toContain('width="0"');
    expect(svg).toContain('height="0"');
  });

  it('should skip missing icons', () => {
    const svg = generateSvg(['javascript', 'nonexistent', 'typescript'], mockIcons, 15);

    expect(svg).toContain('F7DF1E');
    expect(svg).toContain('3178C6');
  });

  it('should calculate correct dimensions', () => {
    // 2 icons, perLine 15: width = min(15, 2) * 300 - 44 = 556
    const svg = generateSvg(['javascript', 'typescript'], mockIcons, 15);

    // Check viewBox contains calculated dimensions
    expect(svg).toContain('viewBox="0 0 556');
  });
});

describe('extractSvgContent', () => {
  it('should remove svg wrapper tags', () => {
    const svg = '<svg width="256" height="256"><rect fill="red"/></svg>';
    const content = extractSvgContent(svg);

    expect(content).toBe('<rect fill="red"/>');
    expect(content).not.toContain('<svg');
    expect(content).not.toContain('</svg>');
  });

  it('should handle complex svg with attributes', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><g><path d="M0 0"/></g></svg>';
    const content = extractSvgContent(svg);

    expect(content).toBe('<g><path d="M0 0"/></g>');
  });
});
