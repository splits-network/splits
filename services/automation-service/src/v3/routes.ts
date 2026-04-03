/**
 * V3 Route Registry — Automation Service
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events.js';
import { registerRuleRoutes } from './rules/routes.js';
import { registerExecutionRoutes } from './executions/routes.js';
import { registerFraudSignalRoutes } from './fraud-signals/routes.js';
import { registerMetricRoutes } from './metrics/routes.js';
import { registerReputationRoutes } from './reputation/routes.js';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerRuleRoutes(app, config.supabase, config.eventPublisher);
  registerExecutionRoutes(app, config.supabase, config.eventPublisher);
  registerFraudSignalRoutes(app, config.supabase, config.eventPublisher);
  registerMetricRoutes(app, config.supabase);
  registerReputationRoutes(app, config.supabase);
}
