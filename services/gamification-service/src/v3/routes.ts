/**
 * V3 Route Registry — Gamification Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { registerXpRoutes } from './xp/routes.js';
import { registerBadgeRoutes } from './badges/routes.js';
import { registerStreakRoutes } from './streaks/routes.js';
import { registerLeaderboardRoutes } from './leaderboards/routes.js';

interface RegisterV3Config {
  supabase: SupabaseClient;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerXpRoutes(app, config.supabase);
  registerBadgeRoutes(app, config.supabase);
  registerStreakRoutes(app, config.supabase);
  registerLeaderboardRoutes(app, config.supabase);
}
