/**
 * Video Service V3 Route Registry
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../v2/shared/events';
import { CallRecordingService } from '../v2/calls/call-recording-service';
import { registerCallRecordingRoutes } from './call-recordings/routes';
import { registerWebhookRoutes } from './recordings/webhook-routes';

interface RegisterV3Config {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  callRecordingService?: CallRecordingService;
  livekitApiKey?: string;
  livekitApiSecret?: string;
}

export function registerV3Routes(app: FastifyInstance, config: RegisterV3Config) {
  registerCallRecordingRoutes(app, config.supabase);

  // Register webhook routes if all required dependencies are available
  if (config.eventPublisher && config.callRecordingService && config.livekitApiKey && config.livekitApiSecret) {
    registerWebhookRoutes(app, {
      supabase: config.supabase,
      callRecordingService: config.callRecordingService,
      eventPublisher: config.eventPublisher,
      livekitApiKey: config.livekitApiKey,
      livekitApiSecret: config.livekitApiSecret,
    });
  }
}
