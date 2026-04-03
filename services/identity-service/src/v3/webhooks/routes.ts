/**
 * Webhooks V3 Routes — Clerk webhook handler + health check
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { Webhook } from 'svix';
import { createLogger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../../v2/shared/events.js';
import { WebhookRepository } from './repository.js';
import { WebhookService } from './service.js';
import { ClerkWebhookEvent, WebhookSourceApp, webhookHeadersSchema, webhookBodySchema } from './types.js';

const SPLITS_WEBHOOK_SECRET = process.env.SPLITS_CLERK_WEBHOOK_SECRET;
const APP_WEBHOOK_SECRET = process.env.APP_CLERK_WEBHOOK_SECRET;
const LEGACY_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

const logger = createLogger({ serviceName: 'identity-service', level: 'info' });

export function registerWebhookRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new WebhookRepository(supabase);
  const service = new WebhookService(repository, eventPublisher!);

  // GET /api/v3/webhooks/health — health check
  app.get('/api/v3/webhooks/health', async (_request, reply) => {
    return reply.send({
      data: { status: 'healthy', timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v3/webhooks/clerk — handle Clerk webhooks
  app.post('/api/v3/webhooks/clerk', {
    schema: { headers: webhookHeadersSchema, body: webhookBodySchema },
  }, async (request, reply) => {
    const secretMap: Array<{ secret: string; source: WebhookSourceApp }> = [
      ...(SPLITS_WEBHOOK_SECRET ? [{ secret: SPLITS_WEBHOOK_SECRET, source: 'portal' as const }] : []),
      ...(APP_WEBHOOK_SECRET ? [{ secret: APP_WEBHOOK_SECRET, source: 'candidate' as const }] : []),
      ...(LEGACY_WEBHOOK_SECRET ? [{ secret: LEGACY_WEBHOOK_SECRET, source: 'unknown' as const }] : []),
    ];

    if (secretMap.length === 0) {
      logger.error('No Clerk webhook secrets configured');
      return reply.code(500).send({
        error: { code: 'WEBHOOK_SECRET_MISSING', message: 'Webhook secret not configured' },
      });
    }

    try {
      const headers = {
        'svix-id': request.headers['svix-id'] as string,
        'svix-timestamp': request.headers['svix-timestamp'] as string,
        'svix-signature': request.headers['svix-signature'] as string,
      };
      const rawBody = (request as any).rawBody as Buffer | undefined;
      const payload = rawBody ? rawBody.toString() : JSON.stringify(request.body);

      let event: ClerkWebhookEvent | null = null;
      let sourceApp: WebhookSourceApp = 'unknown';

      for (const entry of secretMap) {
        try {
          const wh = new Webhook(entry.secret);
          event = wh.verify(payload, headers) as ClerkWebhookEvent;
          sourceApp = entry.source;
          break;
        } catch {
          // Try next secret
        }
      }

      if (!event) {
        throw new Error('Invalid signature: no configured secret could verify this webhook');
      }

      logger.info({ type: event.type, id: event.data.id, sourceApp }, 'Received Clerk webhook');
      await service.handleClerkWebhook(event, sourceApp);

      return reply.send({ data: { message: 'Webhook processed successfully' } });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid signature')) {
        logger.error({ error: error.message }, 'Invalid webhook signature');
        return reply.code(400).send({
          error: { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' },
        });
      }

      logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to process webhook');
      return reply.code(500).send({
        error: { code: 'WEBHOOK_PROCESSING_ERROR', message: 'Failed to process webhook' },
      });
    }
  });
}
