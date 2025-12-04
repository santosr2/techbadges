/**
 * Health check endpoint handler
 */

import icons from '../../dist/icons.json' with { type: 'json' };

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  iconCount: number;
  timestamp: string;
}

/**
 * Handle GET /health
 *
 * Returns health status of the service
 */
export function handleHealth(): Response {
  const iconCount = Object.keys(icons).length;

  const response: HealthResponse = {
    status: iconCount > 0 ? 'ok' : 'degraded',
    version: '1.0.0',
    iconCount,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(response), {
    status: response.status === 'ok' ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
