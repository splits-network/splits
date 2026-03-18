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
import { registerTokenRoute } from './calls/actions/token.route';
import { registerExchangeTokenRoute } from './calls/actions/exchange-token.route';
import { registerNotesRoutes } from './calls/actions/notes.route';
import { registerCalendarPreferencesRoutes } from './calls/actions/calendar-preferences.route';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  livekitApiKey?: string;
  livekitApiSecret?: string;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  // Register non-parameterized routes first (exchange-token, calendar-preferences, stats, tags before :id)
  if (config.livekitApiKey && config.livekitApiSecret) {
    registerExchangeTokenRoute(app, config.supabase, {
      apiKey: config.livekitApiKey,
      apiSecret: config.livekitApiSecret,
    });
  }
  registerCalendarPreferencesRoutes(app, config.supabase);
  registerStatsRoutes(app, config.supabase);
  registerArtifactRoutes(app, config.supabase, config.eventPublisher);
  registerParticipantRoutes(app, config.supabase, config.eventPublisher);
  registerCallRoutes(app, config.supabase, config.eventPublisher);

  // Notes and token actions (parameterized — after CRUD)
  registerNotesRoutes(app, config.supabase);
  if (config.livekitApiKey && config.livekitApiSecret) {
    registerTokenRoute(app, config.supabase, {
      apiKey: config.livekitApiKey,
      apiSecret: config.livekitApiSecret,
    });
  }
}
