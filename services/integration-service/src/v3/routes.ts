/**
 * V3 Route Registry — Integration Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { registerProviderRoutes } from './providers/routes';
import { registerConnectionRoutes } from './connections/routes';
import { registerATSIntegrationRoutes } from './ats-integrations/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerProviderRoutes(app, config.supabase);
  registerConnectionRoutes(app, config.supabase, config.eventPublisher);
  registerATSIntegrationRoutes(app, config.supabase, config.eventPublisher);
}
