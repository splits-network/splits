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
  // ── Call Recordings ────────────────────────────────────────────
  { path: '/call-recordings', method: 'GET', auth: 'required' },
  { path: '/call-recordings/:id/playback-url', method: 'GET', auth: 'required' },
];

export function registerVideoV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const videoClient = services.get('video');

  registerV3Routes(app, videoClient, videoV3Routes);
}
