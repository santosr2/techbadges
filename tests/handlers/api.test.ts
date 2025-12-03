import { describe, expect, it } from 'bun:test';
import { handleApiIcons, handleApiSvgs } from '../../src/handlers/api.js';

describe('handleApiIcons', () => {
  it('should return JSON response', async () => {
    const response = handleApiIcons();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
  });

  it('should return array of icon names', async () => {
    const response = handleApiIcons();
    const data = (await response.json()) as string[];

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should include common icons', async () => {
    const response = handleApiIcons();
    const data = (await response.json()) as string[];

    expect(data).toContain('javascript');
    expect(data).toContain('typescript');
    expect(data).toContain('react');
  });

  it('should not include theme suffixes', async () => {
    const response = handleApiIcons();
    const data = (await response.json()) as string[];

    // Should have base names, not themed variants
    const darkIcons = data.filter(name => name.endsWith('-dark'));
    const lightIcons = data.filter(name => name.endsWith('-light'));

    expect(darkIcons.length).toBe(0);
    expect(lightIcons.length).toBe(0);
  });

  it('should include cache headers', () => {
    const response = handleApiIcons();

    expect(response.headers.get('Cache-Control')).toContain('max-age=');
    expect(response.headers.get('ETag')).toBeDefined();
  });

  it('should include CORS headers', () => {
    const response = handleApiIcons();

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
  });
});

describe('handleApiSvgs', () => {
  it('should return JSON response', async () => {
    const response = handleApiSvgs();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
  });

  it('should return object with SVG content', async () => {
    const response = handleApiSvgs();
    const data = (await response.json()) as Record<string, string>;

    expect(typeof data).toBe('object');
    expect(Object.keys(data).length).toBeGreaterThan(0);
  });

  it('should include SVG content for icons', async () => {
    const response = handleApiSvgs();
    const data = (await response.json()) as Record<string, string>;

    // Check that values are SVG strings
    const keys = Object.keys(data);
    const firstKey = keys[0];
    if (firstKey) {
      expect(data[firstKey]).toContain('<svg');
      expect(data[firstKey]).toContain('</svg>');
    }
  });

  it('should include themed variants', async () => {
    const response = handleApiSvgs();
    const data = (await response.json()) as Record<string, string>;
    const keys = Object.keys(data);

    // Should have both dark and light variants for themed icons
    const hasDark = keys.some(k => k.endsWith('-dark'));
    const hasLight = keys.some(k => k.endsWith('-light'));

    expect(hasDark).toBe(true);
    expect(hasLight).toBe(true);
  });

  it('should include cache headers', () => {
    const response = handleApiSvgs();

    expect(response.headers.get('Cache-Control')).toContain('max-age=');
    expect(response.headers.get('ETag')).toBeDefined();
  });

  it('should include CORS headers', () => {
    const response = handleApiSvgs();

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
  });
});
