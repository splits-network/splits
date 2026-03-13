/**
 * Matching Service V3 Gateway Routes
 *
 * Declarative config for matches and embeddings.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const matchingV3Routes: V3RouteConfig[] = [
  // ── Matches ────────────────────────────────────────────────────
  { path: '/matches', method: 'GET', auth: 'required' },
  { path: '/matches/:id', method: 'GET', auth: 'required' },
  { path: '/matches/:id', method: 'PATCH', auth: 'required' },

  // ── Embeddings ─────────────────────────────────────────────────
  { path: '/embeddings', method: 'GET', auth: 'required' },
  { path: '/embeddings/:id', method: 'GET', auth: 'required' },
];

export function registerMatchingV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const matchingClient = services.get('matching');

  registerV3Routes(app, matchingClient, matchingV3Routes);
}
