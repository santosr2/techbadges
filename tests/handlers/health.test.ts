import { describe, expect, it } from 'bun:test';
import { handleHealth } from '../../src/handlers/health.js';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  iconCount: number;
  timestamp: string;
}

describe('handleHealth', () => {
  it('should return JSON response', async () => {
    const response = handleHealth();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should return health status object', async () => {
    const response = handleHealth();
    const data = (await response.json()) as HealthResponse;

    expect(data.status).toBe('ok');
    expect(typeof data.version).toBe('string');
    expect(typeof data.iconCount).toBe('number');
    expect(typeof data.timestamp).toBe('string');
  });

  it('should report icon count', async () => {
    const response = handleHealth();
    const data = (await response.json()) as HealthResponse;

    // Should have a significant number of icons
    expect(data.iconCount).toBeGreaterThan(100);
  });

  it('should return valid ISO timestamp', async () => {
    const response = handleHealth();
    const data = (await response.json()) as HealthResponse;

    // Should be a valid ISO date string
    const date = new Date(data.timestamp);
    expect(date.toISOString()).toBe(data.timestamp);
  });

  it('should not cache health responses', () => {
    const response = handleHealth();

    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('should return version 1.0.0', async () => {
    const response = handleHealth();
    const data = (await response.json()) as HealthResponse;

    expect(data.version).toBe('1.0.0');
  });
});
