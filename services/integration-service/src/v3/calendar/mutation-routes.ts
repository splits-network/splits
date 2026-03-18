/**
 * Calendar V3 Mutation Routes — Create, update, delete events
 */

import { FastifyInstance } from 'fastify';
import { Logger } from '@splits-network/shared-logging';
import { CalendarService, CreateCalendarEventParams, UpdateCalendarEventParams } from '../../v2/calendar/service';
import { mapErrorStatus } from './routes';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerCalendarMutationRoutes(
  app: FastifyInstance,
  service: CalendarService,
  logger: Logger,
) {
  // POST /api/v3/integrations/calendar/:connectionId/events
  app.post('/api/v3/integrations/calendar/:connectionId/events', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId } = request.params as { connectionId: string };
    const body = request.body as {
      calendar_id: string;
      summary: string;
      description?: string;
      location?: string;
      start_date_time: string;
      end_date_time: string;
      time_zone: string;
      attendee_emails?: string[];
      add_video_conference?: boolean;
      add_google_meet?: boolean;
    };

    if (!body.calendar_id || !body.summary || !body.start_date_time || !body.end_date_time || !body.time_zone) {
      return reply.status(400).send({
        error: 'calendar_id, summary, start_date_time, end_date_time, and time_zone are required',
      });
    }

    try {
      const params: CreateCalendarEventParams = {
        calendarId: body.calendar_id,
        summary: body.summary,
        description: body.description,
        location: body.location,
        startDateTime: body.start_date_time,
        endDateTime: body.end_date_time,
        timeZone: body.time_zone,
        attendeeEmails: body.attendee_emails,
        addVideoConference: body.add_video_conference ?? body.add_google_meet,
      };
      const event = await service.createEvent(connectionId, clerkUserId, params);
      return reply.status(201).send({ data: event });
    } catch (err: any) {
      logger.error({ err, connectionId }, 'Failed to create event');
      return reply.status(500).send({ error: err.message });
    }
  });

  // PATCH /api/v3/integrations/calendar/:connectionId/events/:eventId
  app.patch('/api/v3/integrations/calendar/:connectionId/events/:eventId', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId, eventId } = request.params as { connectionId: string; eventId: string };
    const body = request.body as {
      calendar_id: string;
      summary?: string;
      description?: string;
      location?: string;
      start_date_time?: string;
      end_date_time?: string;
      time_zone?: string;
      attendee_emails?: string[];
    };

    if (!body.calendar_id) {
      return reply.status(400).send({ error: 'calendar_id is required' });
    }

    try {
      const params: UpdateCalendarEventParams = {
        calendarId: body.calendar_id,
        summary: body.summary,
        description: body.description,
        location: body.location,
        startDateTime: body.start_date_time,
        endDateTime: body.end_date_time,
        timeZone: body.time_zone,
        attendeeEmails: body.attendee_emails,
      };
      const event = await service.updateEvent(connectionId, clerkUserId, body.calendar_id, eventId, params);
      return reply.send({ data: event });
    } catch (err: any) {
      logger.error({ err, connectionId, eventId }, 'Failed to update event');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });

  // DELETE /api/v3/integrations/calendar/:connectionId/events/:eventId
  app.delete('/api/v3/integrations/calendar/:connectionId/events/:eventId', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { connectionId, eventId } = request.params as { connectionId: string; eventId: string };
    const query = request.query as { calendar_id?: string };

    if (!query.calendar_id) {
      return reply.status(400).send({ error: 'calendar_id query parameter is required' });
    }

    try {
      await service.deleteEvent(connectionId, clerkUserId, query.calendar_id, eventId);
      return reply.status(204).send();
    } catch (err: any) {
      logger.error({ err, connectionId, eventId }, 'Failed to delete event');
      return reply.status(mapErrorStatus(err)).send({ error: err.message });
    }
  });
}
