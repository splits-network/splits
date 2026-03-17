/**
 * V3 Route Registry -- Chat Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched -- both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { IEventPublisher } from '../v2/shared/events';
import { IChatEventPublisher } from './shared/chat-event-publisher';
import { registerConversationRoutes } from './conversations/routes';
import { registerMessageRoutes } from './messages/routes';
import { registerMessagingCounterRoutes } from './messaging-counters/routes';
import { registerPresenceRoutes } from './presence/routes';
import { registerBlockRoutes } from './blocks/routes';
import { registerAttachmentRoutes } from './attachments/routes';
import { registerReportRoutes } from './reports/routes';
import { registerModerationRoutes } from './moderation/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  chatEventPublisher?: IChatEventPublisher;
  redis?: Redis;
  attachmentQueue?: { addJob(type: string, data: Record<string, any>): Promise<string | void> };
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerConversationRoutes(app, config.supabase, config.eventPublisher, config.chatEventPublisher);
  registerMessageRoutes(app, config.supabase, config.eventPublisher, config.chatEventPublisher);
  registerMessagingCounterRoutes(app, config.supabase);
  registerBlockRoutes(app, config.supabase, config.eventPublisher, config.chatEventPublisher);
  registerReportRoutes(app, config.supabase, config.eventPublisher);
  registerModerationRoutes(app, config.supabase);

  if (config.redis) {
    registerPresenceRoutes(app, config.redis);
  }

  // Attachments V3 -- requires attachment queue for scan jobs
  if (config.attachmentQueue) {
    registerAttachmentRoutes(app, {
      supabase: config.supabase,
      eventPublisher: config.eventPublisher,
      chatEventPublisher: config.chatEventPublisher,
      attachmentQueue: config.attachmentQueue,
      attachmentsEnabled: process.env.CHAT_ATTACHMENTS_ENABLED === 'true',
      attachmentsBucket: process.env.CHAT_ATTACHMENTS_BUCKET || 'chat-attachments',
    });
  }
}
