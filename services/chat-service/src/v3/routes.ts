/**
 * V3 Route Registry — Chat Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { registerConversationRoutes } from './conversations/routes';
import { registerMessagingCounterRoutes } from './messaging-counters/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerConversationRoutes(app, config.supabase, config.eventPublisher);
  registerMessagingCounterRoutes(app, config.supabase);
}
