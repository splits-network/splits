/**
 * V3 Route Registry — Support Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { registerSupportConversationRoutes } from './support-conversations/routes';
import { registerTicketRoutes } from './tickets/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerSupportConversationRoutes(app, config.supabase, config.eventPublisher);
  registerTicketRoutes(app, config.supabase, config.eventPublisher);
}
