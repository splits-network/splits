/**
 * V3 Route Registry — AI Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import type { IAiClient, AiClient } from '@splits-network/shared-ai-client';
import { IEventPublisher } from '../v2/shared/events.js';
import { registerReviewRoutes } from './reviews/routes.js';
import { registerAiConfigRoutes } from './ai-config/routes.js';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  aiClient: IAiClient;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerReviewRoutes(app, config.supabase, config.eventPublisher, config.aiClient);
  registerAiConfigRoutes(app, { supabase: config.supabase, aiClient: config.aiClient as AiClient });
}
