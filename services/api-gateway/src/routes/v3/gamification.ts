/**
 * Gamification Service V3 Gateway Routes
 *
 * Declarative config for badges, XP, streaks, and leaderboards.
 * The proxy layer handles auth, CORS, correlation IDs — no custom handlers.
 */

import { FastifyInstance } from 'fastify';
import { ServiceRegistry } from '../../clients.js';
import { registerV3Routes, V3RouteConfig } from './proxy.js';

const gamificationV3Routes: V3RouteConfig[] = [
  // ── Badges (views before CRUD to avoid :id collision) ──────────
  { path: '/badges/awards/batch', method: 'GET', auth: 'optional' },
  { path: '/badges/awards', method: 'GET', auth: 'optional' },
  { path: '/badges/views/progress', method: 'GET', auth: 'none' },
  { path: '/badges/progress', method: 'GET', auth: 'none' },
  { path: '/badges', method: 'GET', auth: 'required' },
  { path: '/badges/:id', method: 'GET', auth: 'required' },

  // ── XP (views before CRUD to avoid :id collision) ──────────────
  { path: '/xp/levels/batch', method: 'GET', auth: 'optional' },
  { path: '/xp/level', method: 'GET', auth: 'optional' },
  { path: '/xp/history', method: 'GET', auth: 'optional' },
  { path: '/xp', method: 'GET', auth: 'optional' },
  { path: '/xp/:id', method: 'GET', auth: 'optional' },

  // ── Streaks ────────────────────────────────────────────────────
  { path: '/streaks', method: 'GET', auth: 'required' },
  { path: '/streaks/:id', method: 'GET', auth: 'required' },

  // ── Leaderboard Views (public, no auth) ────────────────────────
  { path: '/leaderboards/views/public-listing/rank', method: 'GET', auth: 'none' },
  { path: '/leaderboards/views/public-listing', method: 'GET', auth: 'none' },
  { path: '/leaderboards/:id/view/public-listing', method: 'GET', auth: 'none' },

  // ── Leaderboard Legacy (public, no auth — backward compat) ────
  { path: '/leaderboards/rank', method: 'GET', auth: 'none' },
  { path: '/leaderboards', method: 'GET', auth: 'none' },
  { path: '/leaderboards/:id', method: 'GET', auth: 'none' },
];

export function registerGamificationV3Routes(app: FastifyInstance, services: ServiceRegistry) {
  const gamificationClient = services.get('gamification');

  registerV3Routes(app, gamificationClient, gamificationV3Routes);
}
