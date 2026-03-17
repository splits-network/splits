/**
 * Integration Service V3 Gateway Routes
 *
 * Declarative config for providers, connections, and ATS integrations.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const integrationV3Routes: V3RouteConfig[] = [
  // ── Integration Providers ──────────────────────────────────────
  { path: '/integrations/providers', method: 'GET', auth: 'required' },
  { path: '/integrations/providers/:slug', method: 'GET', auth: 'required' },

  // ── Integration Connections ────────────────────────────────────
  { path: '/integrations/connections', method: 'GET', auth: 'required' },
  { path: '/integrations/connections/:id', method: 'GET', auth: 'required' },
  { path: '/integrations/connections/:id', method: 'DELETE', auth: 'required' },
  { path: '/integrations/connections/initiate', method: 'POST', auth: 'required' },
  { path: '/integrations/connections/callback', method: 'POST', auth: 'required' },

  // ── ATS Integrations Core CRUD ─────────────────────────────────
  { path: '/integrations/ats', method: 'GET', auth: 'required' },
  { path: '/integrations/ats/:id', method: 'GET', auth: 'required' },
  { path: '/integrations/ats', method: 'POST', auth: 'required' },
  { path: '/integrations/ats/:id', method: 'PATCH', auth: 'required' },
  { path: '/integrations/ats/:id', method: 'DELETE', auth: 'required' },

  // ── Email ────────────────────────────────────────────────────────
  { path: '/integrations/email/:connectionId/messages', method: 'GET', auth: 'required' },
  { path: '/integrations/email/:connectionId/messages/:messageId', method: 'GET', auth: 'required' },
  { path: '/integrations/email/:connectionId/messages/send', method: 'POST', auth: 'required' },
  { path: '/integrations/email/:connectionId/threads/:threadId', method: 'GET', auth: 'required' },

  // ── Calendar ─────────────────────────────────────────────────────
  { path: '/integrations/calendar/availability', method: 'GET', auth: 'required' },
  { path: '/integrations/calendar/calls', method: 'POST', auth: 'required' },
  { path: '/integrations/calendar/calls/:callId', method: 'PATCH', auth: 'required' },
  { path: '/integrations/calendar/calls/:callId', method: 'DELETE', auth: 'required' },
  { path: '/integrations/calendar/:connectionId/calendars', method: 'GET', auth: 'required' },
  { path: '/integrations/calendar/:connectionId/events', method: 'GET', auth: 'required' },
  { path: '/integrations/calendar/:connectionId/events', method: 'POST', auth: 'required' },
  { path: '/integrations/calendar/:connectionId/events/:eventId', method: 'PATCH', auth: 'required' },
  { path: '/integrations/calendar/:connectionId/events/:eventId', method: 'DELETE', auth: 'required' },
  { path: '/integrations/calendar/:connectionId/availability', method: 'POST', auth: 'required' },
  { path: '/integrations/calendar/:connectionId/webhooks/subscribe', method: 'POST', auth: 'required' },

  // ── LinkedIn ─────────────────────────────────────────────────────
  { path: '/integrations/linkedin/:connectionId/profile', method: 'GET', auth: 'required' },
  { path: '/integrations/linkedin/:connectionId/verification', method: 'GET', auth: 'required' },
  { path: '/integrations/linkedin/:connectionId/refresh-profile', method: 'POST', auth: 'required' },
];

export function registerIntegrationV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const integrationClient = services.get('integration');

  registerV3Routes(app, integrationClient, integrationV3Routes);
}
