/**
 * POST /api/v3/call-recordings/actions/livekit-webhook
 *
 * Collection-level action: processes LiveKit egress webhooks.
 * NO auth — signature verified by LiveKit WebhookReceiver.
 * Always returns 200 to prevent LiveKit retry storms.
 */

import { FastifyInstance } from 'fastify';
import { LivekitWebhookService } from './livekit-webhook.service';
import { CallRecordingRoutesConfig } from '../routes';

export function registerLivekitWebhookAction(app: FastifyInstance, config: CallRecordingRoutesConfig) {
  const service = new LivekitWebhookService(
    config.supabase,
    config.livekitApiKey,
    config.livekitApiSecret,
    config.eventPublisher,
  );

  app.post('/api/v3/call-recordings/actions/livekit-webhook', async (request, reply) => {
    const body = typeof request.body === 'string'
      ? request.body
      : JSON.stringify(request.body);
    const authHeader = request.headers['authorization'] as string | undefined;

    const result = await service.handleWebhook(body, authHeader);
    return reply.send(result);
  });
}
