/**
 * V3 Route Registry — Gamification Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { registerXpRoutes } from './xp/routes';
import { registerBadgeRoutes } from './badges/routes';
import { registerStreakRoutes } from './streaks/routes';
import { registerLeaderboardRoutes } from './leaderboards/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerXpRoutes(app, config.supabase);
  registerBadgeRoutes(app, config.supabase);
  registerStreakRoutes(app, config.supabase);
  registerLeaderboardRoutes(app, config.supabase);
}
