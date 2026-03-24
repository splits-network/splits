/**
 * V3 Route Registry — Content Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { registerPageRoutes } from './pages/routes';
import { registerNavigationRoutes } from './navigation/routes';
import { registerImageRoutes } from './images/routes';
import { registerTagRoutes } from './tags/routes';
import { registerPageTagRoutes } from './page-tags/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerPageRoutes(app, config.supabase, config.eventPublisher);
  registerNavigationRoutes(app, config.supabase);
  registerImageRoutes(app, config.supabase);
  registerTagRoutes(app, config.supabase);
  registerPageTagRoutes(app, config.supabase);
}
