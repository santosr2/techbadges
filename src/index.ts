/**
 * TechBadges - Cloudflare Worker Entry Point
 *
 * Generates SVG icon grids for GitHub profiles and resumes.
 * https://techbadges.santosr2.xyz
 */

import { handleApiIcons, handleApiSvgs } from './handlers/api.js';
import { handleHealth } from './handlers/health.js';
import { handleIcons } from './handlers/icons.js';
import { createCorsPreflightResponse } from './lib/cache.js';
import { createErrorResponse, NotFoundError } from './lib/errors.js';
import type { Env } from './types/index.js';

/**
 * Main request handler
 */
async function handleRequest(request: Request, _env: Env): Promise<Response> {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return createCorsPreflightResponse();
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/|\/$/g, '');

  // Route to appropriate handler
  switch (path) {
    case 'icons':
      return handleIcons(request, url.searchParams);

    case 'api/icons':
      return handleApiIcons();

    case 'api/svgs':
      return handleApiSvgs();

    case 'health':
      return handleHealth();

    case '':
      // Root path - redirect to documentation or return info
      return new Response(
        JSON.stringify({
          name: 'TechBadges',
          version: '2.0.0',
          description: 'Showcase your tech stack on your GitHub or resume',
          documentation: 'https://github.com/santosr2/techbadges',
          attribution: {
            original: 'skill-icons',
            author: 'tandpfun',
            url: 'https://github.com/tandpfun/skill-icons',
          },
          endpoints: {
            icons: '/icons?i=js,ts,react',
            apiIcons: '/api/icons',
            apiSvgs: '/api/svgs',
            health: '/health',
          },
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
          },
        }
      );

    default:
      throw new NotFoundError(`Endpoint not found: /${path}`);
  }
}

/**
 * Cloudflare Workers entry point (ES Module syntax)
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      const isDev = env.ENVIRONMENT === 'development';
      return createErrorResponse(error, isDev);
    }
  },
};
