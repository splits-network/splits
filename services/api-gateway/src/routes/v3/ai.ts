/**
 * AI Service V3 Gateway Routes
 *
 * Declarative config for AI reviews.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const aiV3Routes: V3RouteConfig[] = [
  // ── AI Reviews — Views (before :id to avoid param collision) ──
  { path: '/ai-reviews/views/job-stats', method: 'GET', auth: 'required' },

  // ── AI Reviews — Actions ──────────────────────────────────────
  { path: '/ai-reviews/actions/analyze', method: 'POST', auth: 'required' },

  // ── AI Reviews — Core CRUD ────────────────────────────────────
  { path: '/ai-reviews', method: 'GET', auth: 'required' },
  { path: '/ai-reviews', method: 'POST', auth: 'required' },
  { path: '/ai-reviews/:id', method: 'GET', auth: 'required' },
];

export function registerAiV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const aiClient = services.get('ai');

  registerV3Routes(app, aiClient, aiV3Routes);
}
