/**
 * Document Service V3 Gateway Routes
 *
 * Declarative config for document management (no POST — uploads handled differently).
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const documentV3Routes: V3RouteConfig[] = [
  // ── Documents (no POST — uploads handled differently) ──────────
  { path: '/documents', method: 'GET', auth: 'required' },
  { path: '/documents/:id', method: 'GET', auth: 'required' },
  { path: '/documents/:id', method: 'PATCH', auth: 'required' },
  { path: '/documents/:id', method: 'DELETE', auth: 'required' },
];

export function registerDocumentV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const documentClient = services.get('document');

  registerV3Routes(app, documentClient, documentV3Routes);
}
