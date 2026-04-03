/**
 * Analytics Service V3 Gateway Routes
 *
 * Declarative config for stats, marketplace metrics, charts, and activity.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients.js';
import { registerV3Routes, V3RouteConfig } from './proxy.js';
import { requireAuth } from '../../middleware/auth.js';
import { buildAuthHeaders } from '../../helpers/auth-headers.js';

const analyticsV3Routes: V3RouteConfig[] = [
  // ── Stats Views ────────────────────────────────────────────────
  { path: '/stats/views/platform-activity', method: 'GET', auth: 'required' },
  { path: '/stats/views/top-performers', method: 'GET', auth: 'required' },

  // ── Stats ──────────────────────────────────────────────────────
  { path: '/stats', method: 'GET', auth: 'required' },

  // ── Marketplace Metrics Core CRUD ──────────────────────────────
  { resource: 'marketplace-metrics', auth: 'required' },

  // ── Charts Views ───────────────────────────────────────────────
  { path: '/charts/views/:type', method: 'GET', auth: 'required' },

  // ── Dashboard Views ───────────────────────────────────────────
  { path: '/views/:type', method: 'GET', auth: 'required' },

  // ── Activity Actions ───────────────────────────────────────────
  { path: '/activity/actions/heartbeat', method: 'POST', auth: 'required' },

  // ── Activity Views ─────────────────────────────────────────────
  { path: '/activity/views/online', method: 'GET', auth: 'required' },
];

export function registerAnalyticsV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const analyticsClient = services.get('analytics');

  registerV3Routes(app, analyticsClient, analyticsV3Routes);

  // ── Charts shorthand (custom handler — rewrites path) ──────────
  // Frontend calls /api/v3/charts/:type but the analytics service
  // V3 route is /api/v3/charts/views/:type. This handler rewrites.
  app.get(
    '/api/v3/charts/:type',
    { preHandler: requireAuth() },
    async (request: any, reply: any) => {
      try {
        const { type } = request.params as { type: string };
        const query = request.query as Record<string, any>;
        const correlationId = (request as any).correlationId;
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) params.append(key, String(value));
        });
        const qs = params.toString();
        const servicePath = qs
          ? `/api/v3/charts/views/${type}?${qs}`
          : `/api/v3/charts/views/${type}`;
        const data = await analyticsClient.get(
          servicePath,
          undefined,
          correlationId,
          buildAuthHeaders(request)
        );
        return reply.send(data);
      } catch (error: any) {
        return reply
          .status(error?.statusCode || 500)
          .send(error?.jsonBody || { error: { code: 'PROXY_ERROR', message: error.message } });
      }
    }
  );
}
