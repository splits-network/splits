/**
 * GPT Service V3 Gateway Routes
 *
 * Declarative config for GPT job search, applications, and OAuth sessions.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const gptV3Routes: V3RouteConfig[] = [
  // ── GPT Action Routes (before parameterized routes) ────────────
  { path: '/gpt/actions/submit-application', method: 'POST', auth: 'required' },
  { path: '/gpt/actions/analyze-resume', method: 'POST', auth: 'required' },

  // ── GPT Actions ────────────────────────────────────────────────
  { path: '/gpt/jobs/search', method: 'GET', auth: 'required' },
  { path: '/gpt/jobs/:id', method: 'GET', auth: 'required' },
  { path: '/gpt/applications', method: 'GET', auth: 'required' },

  // ── GPT OAuth Sessions ─────────────────────────────────────────
  { path: '/gpt/oauth/sessions', method: 'GET', auth: 'required' },
  { path: '/gpt/oauth/sessions/:id/revoke', method: 'POST', auth: 'required' },
];

export function registerGptV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const gptClient = services.get('gpt');

  registerV3Routes(app, gptClient, gptV3Routes);
}
