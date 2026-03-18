/**
 * Calendar V3 Routes — Read operations
 * List calendars, list events, get availability
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { CryptoService } from '@splits-network/shared-config/src/crypto';
import { IEventPublisher } from '../../v2/shared/events';
import { ConnectionAdapter } from '../connections/connection-adapter';
import { TokenRefreshService } from './token-refresh-service';
import { CalendarService } from '../../v2/calendar/service';
import { CalendarWebhookService } from '../../v2/calendar/webhook-service';
import { registerCalendarMutationRoutes } from './mutation-routes';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function mapErrorStatus(err: any): number {
  if (err.message?.includes('Unauthorized')) return 403;
  if (err.message?.includes('not found')) return 404;
  if (err.message?.includes('expired')) return 401;
  return 500;
}

export interface CalendarRouteConfig {
  supabase: SupabaseClient;
  eventPublisher: IEventPublisher;
  logger: Logger;
  crypto: CryptoService;
}

export function registerCalendarRoutes(app: FastifyInstance, config: CalendarRouteConfig) {
  const adapter = new ConnectionAdapter(config.supabase);
  const tokenRefresh = new TokenRefreshService(
    config.supabase, config.eventPublisher, config.logger, config.crypto,
  );
  const service = new CalendarService(adapter as any, tokenRefresh as any, config.logger);
  const webhookBaseUrl = process.env.INTEGRATION_WEBHOOK_URL ?? '';
  const webhookService = new CalendarWebhookService(
    adapter as any, tokenRefresh as any, config.logger, webhookBaseUrl,
  );

  // GET /api/v3/integrations/calendar/:connectionId/calendars
  app.get('/api/v3/integrations/calendar/:connectionId/calendars', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId } = request.params as { connectionId: string };

    try {
      const calendars = await service.listCalendars(connectionId, clerkUserId);
      return reply.send({ data: calendars });
    } catch (err: any) {
      config.logger.error({ err, connectionId }, 'Failed to list calendars');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // GET /api/v3/integrations/calendar/:connectionId/events
  app.get('/api/v3/integrations/calendar/:connectionId/events', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId } = request.params as { connectionId: string };
    const query = request.query as {
      calendar_id?: string;
      time_min?: string;
      time_max?: string;
      max_results?: string;
    };

    if (!query.calendar_id) {
      return reply.status(400).send({ error: 'calendar_id is required' });
    }

    try {
      const events = await service.listEvents(
        connectionId, clerkUserId, query.calendar_id,
        query.time_min ?? new Date().toISOString(),
        query.time_max ?? new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString(),
        query.max_results ? parseInt(query.max_results, 10) : 50,
      );
      return reply.send({ data: events });
    } catch (err: any) {
      config.logger.error({ err, connectionId }, 'Failed to list events');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/v3/integrations/calendar/:connectionId/availability
  app.post('/api/v3/integrations/calendar/:connectionId/availability', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId } = request.params as { connectionId: string };
    const body = request.body as {
      calendar_ids: string[];
      time_min: string;
      time_max: string;
    };

    if (!body.calendar_ids?.length || !body.time_min || !body.time_max) {
      return reply.status(400).send({ error: 'calendar_ids, time_min, and time_max are required' });
    }

    try {
      const availability = await service.getAvailability(
        connectionId, clerkUserId, body.calendar_ids, body.time_min, body.time_max,
      );
      return reply.send({ data: availability });
    } catch (err: any) {
      config.logger.error({ err, connectionId }, 'Failed to get availability');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/v3/integrations/calendar/:connectionId/webhooks/subscribe
  app.post('/api/v3/integrations/calendar/:connectionId/webhooks/subscribe', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId } = request.params as { connectionId: string };
    const body = request.body as { calendar_id: string };

    if (!body.calendar_id) {
      return reply.status(400).send({ error: 'calendar_id is required' });
    }

    try {
      const subscription = await webhookService.subscribeToChanges(connectionId, clerkUserId, body.calendar_id);
      return reply.status(201).send({ data: subscription });
    } catch (err: any) {
      config.logger.error({ err, connectionId }, 'Failed to create webhook subscription');
      return reply.status(500).send({ error: err.message });
    }
  });

  // Register mutation routes (create, update, delete events)
  registerCalendarMutationRoutes(app, service, config.logger);
}
