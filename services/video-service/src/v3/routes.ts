/**
 * Video Service V3 Route Registry
 *
 * Registers all V3 resource routes alongside existing V2 routes.
 * V2 is untouched — both versions coexist and are functional.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { registerCallRecordingRoutes } from './call-recordings/routes';

export interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  livekitApiKey: string;
  livekitApiSecret: string;
  livekitWsUrl: string;
  s3Config: {
    endpoint: string;
    region: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
  };
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerCallRecordingRoutes(app, {
    supabase: config.supabase,
    eventPublisher: config.eventPublisher,
    livekitApiKey: config.livekitApiKey,
    livekitApiSecret: config.livekitApiSecret,
    livekitWsUrl: config.livekitWsUrl,
    s3Config: config.s3Config,
  });
}
