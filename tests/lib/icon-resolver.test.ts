import { describe, expect, it } from 'bun:test';
import { ValidationError } from '../../src/lib/errors.js';
import {
  buildIconSets,
  resolveIconNames,
  validatePerLine,
  validateTheme,
} from '../../src/lib/icon-resolver.js';

describe('buildIconSets', () => {
  it('should build available and themed icon sets', () => {
    const iconKeys = [
      'javascript',
      'react-dark',
      'react-light',
      'python-dark',
      'python-light',
      'docker',
    ];

    const { availableIcons, themedIcons, iconNameList } = buildIconSets(iconKeys);

    expect(availableIcons.has('javascript')).toBe(true);
    expect(availableIcons.has('react-dark')).toBe(true);
    expect(themedIcons.has('react')).toBe(true);
    expect(themedIcons.has('python')).toBe(true);
    expect(themedIcons.has('javascript')).toBe(false);
    expect(iconNameList).toContain('javascript');
    expect(iconNameList).toContain('react');
    expect(iconNameList).not.toContain('react-dark');
  });
});

describe('resolveIconNames', () => {
  const { availableIcons, themedIcons } = buildIconSets([
    'javascript',
    'typescript',
    'react-dark',
    'react-light',
    'python-dark',
    'python-light',
    'docker',
  ]);

  it('should resolve simple icon names', () => {
    const result = resolveIconNames('javascript,docker', undefined, availableIcons, themedIcons);
    expect(result).toEqual(['javascript', 'docker']);
  });

  it('should resolve aliases', () => {
    const result = resolveIconNames('js,ts', undefined, availableIcons, themedIcons);
    expect(result).toEqual(['javascript', 'typescript']);
  });

  it('should apply dark theme to themed icons by default', () => {
    const result = resolveIconNames('react', undefined, availableIcons, themedIcons);
    expect(result).toEqual(['react-dark']);
  });

  it('should apply light theme when specified', () => {
    const result = resolveIconNames('react,python', 'light', availableIcons, themedIcons);
    expect(result).toEqual(['react-light', 'python-light']);
  });

  it('should skip unknown icons silently', () => {
    const result = resolveIconNames(
      'javascript,unknown,docker',
      undefined,
      availableIcons,
      themedIcons
    );
    expect(result).toEqual(['javascript', 'docker']);
  });

  it('should throw on empty icon list', () => {
    expect(() => resolveIconNames('', undefined, availableIcons, themedIcons)).toThrow(
      ValidationError
    );
  });

  it('should handle mixed valid and invalid names', () => {
    const result = resolveIconNames(
      'js, react, notreal, docker',
      'dark',
      availableIcons,
      themedIcons
    );
    expect(result).toEqual(['javascript', 'react-dark', 'docker']);
  });

  it('should enforce maximum icons limit', () => {
    const manyIcons = Array(101).fill('js').join(',');
    expect(() => resolveIconNames(manyIcons, undefined, availableIcons, themedIcons)).toThrow(
      /Maximum/
    );
  });
});

describe('validateTheme', () => {
  it('should return undefined for null', () => {
    expect(validateTheme(null)).toBeUndefined();
  });

  it('should return dark for "dark"', () => {
    expect(validateTheme('dark')).toBe('dark');
  });

  it('should return light for "light"', () => {
    expect(validateTheme('light')).toBe('light');
  });

  it('should throw for invalid theme', () => {
    expect(() => validateTheme('blue')).toThrow(ValidationError);
    expect(() => validateTheme('DARK')).toThrow(ValidationError);
  });
});

describe('validatePerLine', () => {
  it('should return default for null', () => {
    expect(validatePerLine(null, 15)).toBe(15);
  });

  it('should parse valid numbers', () => {
    expect(validatePerLine('10', 15)).toBe(10);
    expect(validatePerLine('1', 15)).toBe(1);
    expect(validatePerLine('50', 15)).toBe(50);
  });

  it('should throw for out of range values', () => {
    expect(() => validatePerLine('0', 15)).toThrow(ValidationError);
    expect(() => validatePerLine('51', 15)).toThrow(ValidationError);
    expect(() => validatePerLine('-1', 15)).toThrow(ValidationError);
  });

  it('should throw for non-numeric values', () => {
    expect(() => validatePerLine('abc', 15)).toThrow(ValidationError);
  });
});
