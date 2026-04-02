/**
 * V3 Route Registry — Notification Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events.js';
import { registerNotificationRoutes } from './notifications/routes.js';
import { registerPreferenceRoutes } from './preferences/routes.js';
import { registerTemplateRoutes } from './templates/routes.js';
import { registerAdminNotificationRoutes } from './admin-notifications/routes.js';
import { registerPushRoutes } from './push/routes.js';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerNotificationRoutes(app, config.supabase, config.eventPublisher);
  registerPreferenceRoutes(app, config.supabase);
  registerTemplateRoutes(app, config.supabase, config.eventPublisher);
  registerAdminNotificationRoutes(app, config.supabase, config.eventPublisher);
  registerPushRoutes(app, config.supabase);
}
