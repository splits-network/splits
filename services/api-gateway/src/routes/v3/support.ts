/**
 * Support Service V3 Gateway Routes
 *
 * Declarative config for tickets and support conversations.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const supportV3Routes: V3RouteConfig[] = [
  // ── Tickets Views (before :id to avoid route collision) ────────
  { path: '/tickets/views/mine', method: 'GET', auth: 'required' },
  { path: '/tickets/views/counts', method: 'GET', auth: 'required' },

  // ── Tickets Actions (before :id) ──────────────────────────────
  { path: '/tickets/:id/actions/reply', method: 'POST', auth: 'required' },
  { path: '/tickets/:id/actions/claim', method: 'POST', auth: 'required' },

  // ── Tickets ────────────────────────────────────────────────────
  { path: '/tickets', method: 'GET', auth: 'required' },
  { path: '/tickets', method: 'POST', auth: 'optional' },
  { path: '/tickets/:id', method: 'GET', auth: 'required' },
  { path: '/tickets/:id', method: 'PATCH', auth: 'required' },

  // ── Support Conversations Views & Actions (before CRUD to avoid :id collision) ──
  { path: '/support/conversations/mine', method: 'GET', auth: 'optional' },
  { path: '/support/conversations/link-session', method: 'POST', auth: 'optional' },
  { path: '/support/conversations/actions/link-session', method: 'POST', auth: 'optional' },
  { path: '/support/conversations/:id/view/admin-detail', method: 'GET', auth: 'required' },
  { path: '/support/conversations/:id/actions/claim', method: 'POST', auth: 'required' },
  { path: '/support/conversations/:id/messages', method: 'GET', auth: 'optional' },
  { path: '/support/conversations/:id/messages', method: 'POST', auth: 'optional' },

  // ── Support Conversations Core CRUD ────────────────────────────
  { resource: 'support/conversations', auth: 'optional' },

  // ── Support Admin Status (public — under /public/ to bypass global auth hook) ──
  { path: '/public/support/admin-status', method: 'GET', auth: 'none' },
];

export function registerSupportV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const supportClient = services.get('support');

  registerV3Routes(app, supportClient, supportV3Routes);
}
