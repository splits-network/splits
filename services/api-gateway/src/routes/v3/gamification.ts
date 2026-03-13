/**
 * Gamification Service V3 Gateway Routes
 *
 * Declarative config for badges, XP, streaks, and leaderboards.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { registerV3Routes, V3RouteConfig } from './proxy';

const gamificationV3Routes: V3RouteConfig[] = [
  // ── Badges (batch view before CRUD to avoid :id collision) ─────
  { path: '/badges/awards/batch', method: 'GET', auth: 'optional' },
  { path: '/badges', method: 'GET', auth: 'optional' },
  { path: '/badges/:id', method: 'GET', auth: 'optional' },

  // ── XP (batch view before CRUD to avoid :id collision) ─────────
  { path: '/xp/levels/batch', method: 'GET', auth: 'optional' },
  { path: '/xp', method: 'GET', auth: 'optional' },
  { path: '/xp/:id', method: 'GET', auth: 'optional' },

  // ── Streaks ────────────────────────────────────────────────────
  { path: '/streaks', method: 'GET', auth: 'required' },
  { path: '/streaks/:id', method: 'GET', auth: 'required' },

  // ── Leaderboards ───────────────────────────────────────────────
  { path: '/leaderboards', method: 'GET', auth: 'optional' },
  { path: '/leaderboards/:id', method: 'GET', auth: 'optional' },
];

export function registerGamificationV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const gamificationClient = services.get('gamification');

  registerV3Routes(app, gamificationClient, gamificationV3Routes);
}
