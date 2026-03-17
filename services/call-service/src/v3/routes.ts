/**
 * V3 Route Registry — Call Service
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { registerStatsRoutes } from './stats/routes';
import { registerArtifactRoutes } from './artifacts/routes';
import { registerParticipantRoutes } from './participants/routes';
import { registerCallRoutes } from './calls/routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  // Register non-parameterized routes first (stats, tags before :id)
  registerStatsRoutes(app, config.supabase);
  registerArtifactRoutes(app, config.supabase, config.eventPublisher);
  registerParticipantRoutes(app, config.supabase, config.eventPublisher);
  registerCallRoutes(app, config.supabase, config.eventPublisher);
}
