/**
 * Video Service V3 Gateway Routes
 *
 * Declarative config for call recordings.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const videoV3Routes: V3RouteConfig[] = [
  // ── Call Recordings Views (before CRUD to avoid :id collision) ──
  { path: '/call-recordings/:id/view/playback', method: 'GET', auth: 'required' },

  // ── Call Recordings Actions (before CRUD to avoid :id collision) ──
  { path: '/call-recordings/actions/start', method: 'POST', auth: 'required' },
  { path: '/call-recordings/:id/actions/stop', method: 'POST', auth: 'required' },
  { path: '/call-recordings/actions/livekit-webhook', method: 'POST', auth: 'none' },

  // ── Call Recordings Core CRUD ──────────────────────────────────
  { resource: 'call-recordings', auth: 'required' },
];

export function registerVideoV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const videoClient = services.get('video');

  registerV3Routes(app, videoClient, videoV3Routes);
}
