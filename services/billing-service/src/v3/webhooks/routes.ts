/**
 * Webhooks V3 Routes - Stripe webhook endpoint + health check
 *
 * Signature verification, idempotent event storage, and handler dispatch.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { UnauthorizedError } from '@splits-network/shared-fastify';
import Stripe from 'stripe';
import { IEventPublisher } from '../../v2/shared/events.js';
import { WebhookRepository } from './repository.js';
import { WebhookEventRepository } from '../webhook-events/repository.js';
import { WebhookService } from './service.js';

export function registerWebhookRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  stripeWebhookSecret?: string,
  stripeSecretKey?: string
) {
  const repository = new WebhookRepository(supabase);
  const logger = app.log as unknown as Logger;
  const webhookEventRepo = new WebhookEventRepository(supabase);

  // Only register full webhook processing if we have an event publisher
  if (eventPublisher) {
    const service = new WebhookService(repository, supabase, logger, eventPublisher, stripeSecretKey);
    const secret = stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET || '';

    app.post('/api/v3/webhooks/stripe', async (request: FastifyRequest, reply: FastifyReply) => {
      const signature = request.headers['stripe-signature'];
      if (!signature) throw new UnauthorizedError('Missing stripe-signature header');

      let event: Stripe.Event;
      try {
        const stripe = new Stripe(stripeSecretKey || process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2025-11-17.clover',
        });
        event = stripe.webhooks.constructEvent(
          (request as any).rawBody as Buffer,
          signature as string,
          secret
        );
      } catch (err: any) {
        request.log.error('Webhook signature verification failed', err);
        throw new UnauthorizedError('Invalid webhook signature');
      }

      // Store event and check for duplicates
      let isNew: boolean;
      try {
        const result = await webhookEventRepo.store({
          stripe_event_id: event.id,
          event_type: event.type,
          api_version: event.api_version,
          livemode: event.livemode,
          payload: event.data.object as Record<string, any>,
        });
        isNew = result.isNew;

        if (!isNew && result.record.processing_status === 'succeeded') {
          request.log.info(
            { stripe_event_id: event.id, type: event.type },
            'Skipping duplicate webhook event (already succeeded)'
          );
          return reply.send({ received: true });
        }
      } catch (storeErr: any) {
        request.log.error({ err: storeErr, stripe_event_id: event.id }, 'Failed to store webhook event');
        isNew = true;
      }

      // Process the event
      try {
        await webhookEventRepo.updateStatus(event.id, 'processing');
        await service.handleStripeWebhook(event);
        await webhookEventRepo.updateStatus(event.id, 'succeeded');
      } catch (processErr: any) {
        request.log.error({ err: processErr, stripe_event_id: event.id, type: event.type }, 'Webhook event processing failed');
        await webhookEventRepo.updateStatus(event.id, 'failed', processErr.message || 'Unknown error').catch(() => {});
        throw processErr;
      }

      return reply.send({ received: true });
    });
  }

  // Health check (always registered)
  app.get('/api/v3/billing-webhooks/health', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const service = new WebhookService(repository, supabase, logger, null as any);
    const data = await service.getHealth();
    return reply.send({ data });
  });
}
