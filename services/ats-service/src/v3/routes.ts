/**
 * V3 Route Registry — ATS Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { registerJobRoutes } from './jobs/routes';
import { registerJobRequirementRoutes } from './job-requirements/routes';
import { registerJobSkillRoutes } from './job-skills/routes';
import { registerSavedJobRoutes } from './saved-jobs/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerJobRoutes(app, config.supabase, config.eventPublisher);
  registerJobRequirementRoutes(app, config.supabase);
  registerJobSkillRoutes(app, config.supabase);
  registerSavedJobRoutes(app, config.supabase, config.eventPublisher);
}
