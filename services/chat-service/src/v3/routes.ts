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
import { registerMessageRoutes } from './messages/routes';
import { registerMessagingCounterRoutes } from './messaging-counters/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  chatEventPublisher?: IChatEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerConversationRoutes(app, config.supabase, config.eventPublisher, config.chatEventPublisher);
  registerMessageRoutes(app, config.supabase, config.eventPublisher, config.chatEventPublisher);
  registerMessagingCounterRoutes(app, config.supabase);
}
