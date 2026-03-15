/**
 * Content Service V3 Gateway Routes
 *
 * Declarative config for pages, navigation, and content images.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const contentV3Routes: V3RouteConfig[] = [
  // ── Pages Views ────────────────────────────────────────────────
  { path: '/pages/views/by-slug/:slug', method: 'GET', auth: 'none' },

  // ── Pages Core CRUD ────────────────────────────────────────────
  { resource: 'pages', auth: 'required' },

  // ── Navigation ─────────────────────────────────────────────────
  { path: '/navigation', method: 'GET', auth: 'none' },
  { path: '/navigation', method: 'POST', auth: 'required' },
  { path: '/navigation/:id', method: 'GET', auth: 'none' },
  { path: '/navigation/:id', method: 'DELETE', auth: 'required' },

  // ── Content Images ─────────────────────────────────────────────
  { path: '/content-images', method: 'GET', auth: 'required' },
  { path: '/content-images/:id', method: 'GET', auth: 'required' },
  { path: '/content-images/:id', method: 'PATCH', auth: 'required' },
  { path: '/content-images/:id', method: 'DELETE', auth: 'required' },
];

export function registerContentV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const contentClient = services.get('content');

  registerV3Routes(app, contentClient, contentV3Routes);
}
