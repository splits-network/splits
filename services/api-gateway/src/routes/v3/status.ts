/**
 * Status / Health Monitor V3 Gateway Routes
 *
 * Declarative proxy to health-monitor service.
 * All endpoints are public (auth: 'none') — uses /public/ prefix for auth bypass.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const statusV3Routes: V3RouteConfig[] = [
  // ── Public system health (proxied to health-monitor service) ───
  { path: '/public/system-health', method: 'GET', auth: 'none' },
  { path: '/public/system-health/incidents', method: 'GET', auth: 'none' },

  // ── Public status contact form ─────────────────────────────────
  { path: '/public/status-contact', method: 'POST', auth: 'none' },
];

export function registerStatusV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const healthMonitorClient = services.get('health-monitor');

  registerV3Routes(app, healthMonitorClient, statusV3Routes);
}
