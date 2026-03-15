/**
 * V3 Route Registry — Chat Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { IChatEventPublisher } from './shared/chat-event-publisher';
import { registerConversationRoutes } from './conversations/routes';
import { registerMessagingCounterRoutes } from './messaging-counters/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  chatEventPublisher?: IChatEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerConversationRoutes(app, config.supabase, config.eventPublisher, config.chatEventPublisher);
  // Message routes (GET/POST .../messages) are registered as V3 aliases in V2 chat routes
  // to preserve the richer V2 service logic (participant-aware, resync, etc.)
  registerMessagingCounterRoutes(app, config.supabase);
}
