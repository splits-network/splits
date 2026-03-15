/**
 * V3 LiveKit Egress Webhook Routes
 *
 * POST /api/v3/calls/recording/webhook
 * No auth — signature is verified by LiveKit WebhookReceiver.
 * Always returns 200 to prevent LiveKit retry storms.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { CallRecordingService } from '../../v2/calls/call-recording-service';
import { CallRecordingRepository } from '../call-recordings/repository';
import { LiveKitWebhookHandler } from './webhook-handler';

export interface WebhookRoutesConfig {
  supabase: SupabaseClient;
  callRecordingService: CallRecordingService;
  eventPublisher: IEventPublisher;
  livekitApiKey: string;
  livekitApiSecret: string;
}

export function registerWebhookRoutes(
  app: FastifyInstance,
  config: WebhookRoutesConfig,
) {
  const repository = new CallRecordingRepository(config.supabase);

  const handler = new LiveKitWebhookHandler(
    {
      callRecordingService: config.callRecordingService,
      callRecordingRepository: repository,
      eventPublisher: config.eventPublisher,
      livekitApiKey: config.livekitApiKey,
      livekitApiSecret: config.livekitApiSecret,
    },
    app.log as any,
  );

  // POST /api/v3/calls/recording/webhook — LiveKit Egress webhook (NO AUTH)
  app.post('/api/v3/calls/recording/webhook', async (request, reply) => {
    const body = typeof request.body === 'string'
      ? request.body
      : JSON.stringify(request.body);
    const authHeader = request.headers['authorization'] as string | undefined;

    const result = await handler.handleWebhook(body, authHeader);
    return reply.send(result);
  });
}
