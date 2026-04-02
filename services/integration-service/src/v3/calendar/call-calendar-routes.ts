/**
 * Call Calendar V3 Routes
 * Multi-user availability and calendar event management for calls
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { CryptoService } from '@splits-network/shared-config/src/crypto';
import { IEventPublisher } from '../../v2/shared/events.js';
import { ConnectionAdapter } from '../connections/connection-adapter.js';
import { TokenRefreshService } from './token-refresh-service.js';
import { CallCalendarRepository } from './call-calendar-repository.js';
import { CalendarService } from '../../v2/calendar/service.js';
import { CallCalendarService } from '../../v2/calendar/call-calendar-service.js';

interface CallCalendarRouteConfig {
  supabase: SupabaseClient;
  eventPublisher: IEventPublisher;
  logger: Logger;
  crypto: CryptoService;
}

export function registerCallCalendarRoutes(app: FastifyInstance, config: CallCalendarRouteConfig) {
  const adapter = new ConnectionAdapter(config.supabase);
  const tokenRefresh = new TokenRefreshService(
    config.supabase, config.eventPublisher, config.logger, config.crypto,
  );
  const calendarService = new CalendarService(adapter as any, tokenRefresh as any, config.logger);
  const callCalendarRepo = new CallCalendarRepository(config.supabase);
  const service = new CallCalendarService(
    calendarService, callCalendarRepo as any, adapter as any, tokenRefresh as any, config.logger,
  );

  // GET /api/v3/integrations/calendar/availability
  app.get('/api/v3/integrations/calendar/availability', async (request, reply) => {
    const query = request.query as {
      user_ids?: string;
      date_from?: string;
      date_to?: string;
    };

    if (!query.user_ids || !query.date_from || !query.date_to) {
      return reply.status(400).send({
        error: 'user_ids (comma-separated), date_from, and date_to are required',
      });
    }

    const clerkUserIds = query.user_ids.split(',').map(id => id.trim()).filter(Boolean);
    if (clerkUserIds.length === 0) {
      return reply.status(400).send({ error: 'At least one user_id is required' });
    }

    try {
      const availability = await service.getMultiUserAvailability(
        clerkUserIds, query.date_from, query.date_to,
      );
      return reply.send({ data: availability });
    } catch (err: any) {
      config.logger.error({ err }, 'Failed to get multi-user availability');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/v3/integrations/calendar/calls
  app.post('/api/v3/integrations/calendar/calls', async (request, reply) => {
    const body = request.body as {
      call_id: string;
      title: string;
      scheduled_at: string;
      duration_minutes?: number;
      agenda?: string | null;
      participants: { user_id: string; clerk_user_id: string; email: string; name: string }[];
      join_url: string;
      time_zone?: string;
    };

    if (!body.call_id || !body.title || !body.scheduled_at || !body.participants?.length || !body.join_url) {
      return reply.status(400).send({
        error: 'call_id, title, scheduled_at, participants, and join_url are required',
      });
    }

    try {
      const count = await service.createCallCalendarEvents({
        callId: body.call_id,
        title: body.title,
        scheduledAt: body.scheduled_at,
        durationMinutes: body.duration_minutes ?? 30,
        agenda: body.agenda ?? null,
        participants: body.participants.map(p => ({
          userId: p.user_id,
          clerkUserId: p.clerk_user_id,
          email: p.email,
          name: p.name,
        })),
        joinUrl: body.join_url,
        timeZone: body.time_zone,
      });
      return reply.status(201).send({ data: { created_count: count } });
    } catch (err: any) {
      config.logger.error({ err, callId: body.call_id }, 'Failed to create call calendar events');
      return reply.status(500).send({ error: err.message });
    }
  });

  // PATCH /api/v3/integrations/calendar/calls/:callId
  app.patch('/api/v3/integrations/calendar/calls/:callId', async (request, reply) => {
    const { callId } = request.params as { callId: string };
    const body = request.body as {
      new_scheduled_at: string;
      new_duration_minutes?: number;
      title?: string;
      agenda?: string | null;
      join_url?: string;
      time_zone?: string;
    };

    if (!body.new_scheduled_at) {
      return reply.status(400).send({ error: 'new_scheduled_at is required' });
    }

    try {
      const count = await service.updateCallCalendarEvents({
        callId,
        newScheduledAt: body.new_scheduled_at,
        newDurationMinutes: body.new_duration_minutes,
        title: body.title,
        agenda: body.agenda,
        joinUrl: body.join_url,
        timeZone: body.time_zone,
      });
      return reply.send({ data: { updated_count: count } });
    } catch (err: any) {
      config.logger.error({ err, callId }, 'Failed to update call calendar events');
      return reply.status(500).send({ error: err.message });
    }
  });

  // DELETE /api/v3/integrations/calendar/calls/:callId
  app.delete('/api/v3/integrations/calendar/calls/:callId', async (request, reply) => {
    const { callId } = request.params as { callId: string };

    try {
      const count = await service.deleteCallCalendarEvents(callId);
      return reply.send({ data: { deleted_count: count } });
    } catch (err: any) {
      config.logger.error({ err, callId }, 'Failed to delete call calendar events');
      return reply.status(500).send({ error: err.message });
    }
  });
}
