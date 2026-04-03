/**
 * Calendar Webhook Routes — V3
 * Receives push notifications from Google Calendar and Microsoft Graph.
 * These endpoints are called by external providers, not by authenticated users.
 */

import { FastifyInstance } from 'fastify';
import { Logger } from '@splits-network/shared-logging';
import { SupabaseClient } from '@supabase/supabase-js';
import { CryptoService } from '@splits-network/shared-config/src/crypto';
import { IEventPublisher } from '../../v2/shared/events.js';
import { TokenRefreshService } from './token-refresh-service.js';
import { CalendarWebhookService } from './webhook-service.js';
import { GoogleWebhookHeaders, MicrosoftWebhookNotification } from './types.js';

interface WebhookRouteConfig {
  supabase: SupabaseClient;
  eventPublisher: IEventPublisher;
  logger: Logger;
  crypto: CryptoService;
  webhookBaseUrl: string;
}

export function registerCalendarWebhookRoutes(app: FastifyInstance, config: WebhookRouteConfig) {
  const tokenRefresh = new TokenRefreshService(
    config.supabase,
    config.eventPublisher,
    config.logger,
    config.crypto,
  );

  const webhookService = new CalendarWebhookService(
    config.supabase,
    tokenRefresh,
    config.logger,
    config.webhookBaseUrl,
  );

  // POST /api/v3/integrations/webhooks/google
  app.post('/api/v3/integrations/webhooks/google', async (request, reply) => {
    const headers = request.headers as unknown as GoogleWebhookHeaders;
    const event = webhookService.handleGoogleWebhook(headers);

    if (!event) {
      return reply.status(200).send({ data: { acknowledged: true } });
    }

    try {
      await config.eventPublisher.publish('integration.calendar_changed', {
        type: 'integration.calendar_changed',
        connection_id: event.connectionId,
        calendar_id: event.calendarId,
        change_type: event.changeType,
        resource_id: event.resourceId,
        provider: 'google',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      config.logger.error({ err, event }, 'Failed to publish Google calendar change event');
    }

    return reply.status(200).send({ data: { acknowledged: true } });
  });

  // POST /api/v3/integrations/webhooks/microsoft
  app.post('/api/v3/integrations/webhooks/microsoft', async (request, reply) => {
    // Microsoft validation: respond to validation token on subscription creation
    const query = request.query as { validationToken?: string };
    if (query.validationToken) {
      return reply.status(200).type('text/plain').send(query.validationToken);
    }

    const body = request.body as MicrosoftWebhookNotification;
    const events = webhookService.handleMicrosoftWebhook(body);

    for (const event of events) {
      try {
        await config.eventPublisher.publish('integration.calendar_changed', {
          type: 'integration.calendar_changed',
          connection_id: event.connectionId,
          calendar_id: event.calendarId,
          change_type: event.changeType,
          resource_id: event.resourceId,
          provider: 'microsoft',
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        config.logger.error({ err, event }, 'Failed to publish Microsoft calendar change event');
      }
    }

    return reply.status(200).send({ data: { acknowledged: true } });
  });
}
