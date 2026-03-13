/**
 * GPT Service V3 Route Registry
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { registerGptActionRoutes } from './actions/routes';
import { registerOAuthSessionRoutes } from './oauth/routes';

export function registerV3Routes(app: FastifyInstance, supabase: SupabaseClient) {
  registerGptActionRoutes(app, supabase);
  registerOAuthSessionRoutes(app, supabase);
}
