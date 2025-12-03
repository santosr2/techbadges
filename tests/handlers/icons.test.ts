import { describe, expect, it } from 'bun:test';
import { handleIcons } from '../../src/handlers/icons.js';

describe('handleIcons', () => {
  it('should return SVG response for valid icons', () => {
    const request = new Request('https://example.com/icons?i=js,ts');
    const searchParams = new URL(request.url).searchParams;
    const response = handleIcons(request, searchParams);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml; charset=utf-8');
  });

  it('should include cache headers', () => {
    const request = new Request('https://example.com/icons?i=js');
    const searchParams = new URL(request.url).searchParams;
    const response = handleIcons(request, searchParams);

    expect(response.headers.get('Cache-Control')).toContain('max-age=');
    expect(response.headers.get('ETag')).toBeDefined();
  });

  it('should include CORS headers', () => {
    const request = new Request('https://example.com/icons?i=js');
    const searchParams = new URL(request.url).searchParams;
    const response = handleIcons(request, searchParams);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('should return 304 for matching ETag', async () => {
    const request1 = new Request('https://example.com/icons?i=js');
    const searchParams1 = new URL(request1.url).searchParams;
    const response1 = handleIcons(request1, searchParams1);
    const etag = response1.headers.get('ETag');

    const request2 = new Request('https://example.com/icons?i=js', {
      headers: { 'If-None-Match': etag ?? '' },
    });
    const searchParams2 = new URL(request2.url).searchParams;
    const response2 = handleIcons(request2, searchParams2);

    expect(response2.status).toBe(304);
  });

  it('should throw ValidationError for missing icons parameter', () => {
    const request = new Request('https://example.com/icons');
    const searchParams = new URL(request.url).searchParams;

    expect(() => handleIcons(request, searchParams)).toThrow("You didn't specify any icons!");
  });

  it('should accept "icons" parameter as alternative to "i"', () => {
    const request = new Request('https://example.com/icons?icons=js,ts');
    const searchParams = new URL(request.url).searchParams;
    const response = handleIcons(request, searchParams);

    expect(response.status).toBe(200);
  });

  it('should handle theme parameter', async () => {
    const requestDark = new Request('https://example.com/icons?i=github&t=dark');
    const searchParamsDark = new URL(requestDark.url).searchParams;
    const responseDark = handleIcons(requestDark, searchParamsDark);
    const svgDark = await responseDark.text();

    const requestLight = new Request('https://example.com/icons?i=github&t=light');
    const searchParamsLight = new URL(requestLight.url).searchParams;
    const responseLight = handleIcons(requestLight, searchParamsLight);
    const svgLight = await responseLight.text();

    // Different themes should produce different SVGs
    expect(svgDark).not.toBe(svgLight);
  });

  it('should accept "theme" parameter as alternative to "t"', () => {
    const request = new Request('https://example.com/icons?i=github&theme=light');
    const searchParams = new URL(request.url).searchParams;
    const response = handleIcons(request, searchParams);

    expect(response.status).toBe(200);
  });

  it('should throw ValidationError for invalid theme', () => {
    const request = new Request('https://example.com/icons?i=js&t=invalid');
    const searchParams = new URL(request.url).searchParams;

    expect(() => handleIcons(request, searchParams)).toThrow(
      'Theme must be either "light" or "dark"'
    );
  });

  it('should handle perline parameter', async () => {
    const request5 = new Request('https://example.com/icons?i=js,ts,react,vue,angular&perline=5');
    const searchParams5 = new URL(request5.url).searchParams;
    const response5 = handleIcons(request5, searchParams5);
    const svg5 = await response5.text();

    const request2 = new Request('https://example.com/icons?i=js,ts,react,vue,angular&perline=2');
    const searchParams2 = new URL(request2.url).searchParams;
    const response2 = handleIcons(request2, searchParams2);
    const svg2 = await response2.text();

    // Different perline should produce different dimensions
    expect(svg5).not.toBe(svg2);
  });

  it('should throw ValidationError for invalid perline', () => {
    const request = new Request('https://example.com/icons?i=js&perline=100');
    const searchParams = new URL(request.url).searchParams;

    expect(() => handleIcons(request, searchParams)).toThrow(
      'Icons per line must be a number between 1 and 50'
    );
  });

  it('should throw ValidationError for non-numeric perline', () => {
    const request = new Request('https://example.com/icons?i=js&perline=abc');
    const searchParams = new URL(request.url).searchParams;

    expect(() => handleIcons(request, searchParams)).toThrow(
      'Icons per line must be a number between 1 and 50'
    );
  });

  it('should handle "all" parameter to get all icons', async () => {
    const request = new Request('https://example.com/icons?i=all');
    const searchParams = new URL(request.url).searchParams;

    // "all" expands to more than MAX_ICONS_PER_REQUEST (100), so it should throw
    // This is expected behavior to prevent abuse
    expect(() => handleIcons(request, searchParams)).toThrow(
      'Maximum 100 icons allowed per request'
    );
  });

  it('should resolve icon aliases', async () => {
    const requestAlias = new Request('https://example.com/icons?i=js');
    const searchParamsAlias = new URL(requestAlias.url).searchParams;
    const responseAlias = handleIcons(requestAlias, searchParamsAlias);
    const svgAlias = await responseAlias.text();

    const requestFull = new Request('https://example.com/icons?i=javascript');
    const searchParamsFull = new URL(requestFull.url).searchParams;
    const responseFull = handleIcons(requestFull, searchParamsFull);
    const svgFull = await responseFull.text();

    // Alias should resolve to same icon
    expect(svgAlias).toBe(svgFull);
  });

  it('should skip unknown icons silently', () => {
    const request = new Request('https://example.com/icons?i=js,unknownicon123,ts');
    const searchParams = new URL(request.url).searchParams;
    const response = handleIcons(request, searchParams);

    // Should succeed with just the valid icons
    expect(response.status).toBe(200);
  });

  it('should throw when all icons are invalid', () => {
    const request = new Request('https://example.com/icons?i=unknownicon1,unknownicon2');
    const searchParams = new URL(request.url).searchParams;

    expect(() => handleIcons(request, searchParams)).toThrow(
      'No valid icons found for the specified names'
    );
  });
});
