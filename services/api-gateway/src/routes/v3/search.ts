/**
 * Search Service V3 Gateway Routes
 *
 * Declarative config for search.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const searchV3Routes: V3RouteConfig[] = [
  // ── Search ─────────────────────────────────────────────────────
  { path: '/search', method: 'GET', auth: 'required' },
];

export function registerSearchV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const searchClient = services.get('search');

  registerV3Routes(app, searchClient, searchV3Routes);
}
