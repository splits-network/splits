/**
 * Call Service V3 Gateway Routes
 *
 * Declarative config for calls, participants, artifacts, and stats.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients.js';
import { registerV3Routes, V3RouteConfig } from './proxy.js';

const callV3Routes: V3RouteConfig[] = [
  // ── Public Routes (no auth, before :id to avoid collision) ───
  { path: '/public/calls/exchange-token', method: 'POST', auth: 'none' },

  // ── Calls Stats, Tags & Preferences (before CRUD to avoid :id collision)
  { path: '/calls/stats', method: 'GET', auth: 'required' },
  { path: '/calls/tags', method: 'GET', auth: 'required' },
  { path: '/calls/calendar-preferences', method: 'GET', auth: 'required' },
  { path: '/calls/calendar-preferences', method: 'PUT', auth: 'required' },

  // ── Calls Views (before CRUD to avoid :id collision) ──────────
  { path: '/calls/views/my-calls', method: 'GET', auth: 'required' },
  { path: '/calls/:id/view/detail', method: 'GET', auth: 'required' },

  // ── Calls Core CRUD ────────────────────────────────────────────
  { resource: 'calls', auth: 'required' },

  // ── Call Participants ──────────────────────────────────────────
  { path: '/calls/:callId/participants', method: 'GET', auth: 'required' },
  { path: '/calls/:callId/participants', method: 'POST', auth: 'required' },
  { path: '/calls/:callId/participants/:id', method: 'GET', auth: 'required' },
  { path: '/calls/:callId/participants/:id', method: 'DELETE', auth: 'required' },

  // ── Call Entities ──────────────────────────────────────────────
  { path: '/calls/:callId/entities', method: 'GET', auth: 'required' },
  { path: '/calls/:callId/entities', method: 'POST', auth: 'required' },
  { path: '/calls/:callId/entities/:id', method: 'DELETE', auth: 'required' },

  // ── Call Notes ────────────────────────────────────────────────
  { path: '/calls/:id/notes', method: 'GET', auth: 'required' },
  { path: '/calls/:id/notes', method: 'POST', auth: 'required' },

  // ── Call Lifecycle Actions ───────────────────────────────────
  { path: '/calls/:id/token', method: 'POST', auth: 'required' },
  { path: '/calls/:id/start', method: 'POST', auth: 'required' },
  { path: '/calls/:id/end', method: 'POST', auth: 'required' },
  { path: '/calls/:id/cancel', method: 'POST', auth: 'required' },
  { path: '/calls/:id/reschedule', method: 'POST', auth: 'required' },
  { path: '/calls/:id/decline', method: 'POST', auth: 'required' },
];

export function registerCallV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const callClient = services.get('call');

  registerV3Routes(app, callClient, callV3Routes);
}
