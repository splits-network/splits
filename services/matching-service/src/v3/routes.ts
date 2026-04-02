/**
 * V3 Route Registry — Matching Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events.js';
import { registerMatchRoutes } from './matches/routes.js';
import { registerEmbeddingRoutes } from './embeddings/routes.js';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerMatchRoutes(app, config.supabase, config.eventPublisher);
  registerEmbeddingRoutes(app, config.supabase);
}
