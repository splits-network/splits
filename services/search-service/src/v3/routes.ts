/**
 * V3 Route Registry — Search Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { registerSearchRoutes } from './search/routes.js';

interface RegisterV3Config {
  supabase: SupabaseClient;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerSearchRoutes(app, config.supabase);
}
