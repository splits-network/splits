import { FastifyInstance } from 'fastify';
import { ConnectionRepository } from '../connections/repository';
import { TokenRefreshService } from './token-refresh';
import { CalendarService, CreateCalendarEventParams } from './service';
import { IEventPublisher } from '../shared/events';
import { requireUserContext } from '../shared/helpers';
import { Logger } from '@splits-network/shared-logging';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: IEventPublisher;
    logger: Logger;
}

export async function registerCalendarRoutes(app: FastifyInstance, config: RegisterConfig) {
    const connectionRepo = new ConnectionRepository(config.supabaseUrl, config.supabaseKey);
    const tokenRefresh = new TokenRefreshService(connectionRepo, config.eventPublisher, config.logger);
    const service = new CalendarService(connectionRepo, tokenRefresh, config.logger);

    // GET /api/v2/integrations/calendar/:connectionId/calendars
    app.get('/api/v2/integrations/calendar/:connectionId/calendars', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { connectionId } = request.params as { connectionId: string };

        try {
            const calendars = await service.listCalendars(connectionId, clerkUserId);
            return reply.send({ data: calendars });
        } catch (err: any) {
            config.logger.error({ err, connectionId }, 'Failed to list calendars');
            const status = err.message.includes('Unauthorized') ? 403
                : err.message.includes('not found') ? 404
                : err.message.includes('expired') ? 401
                : 500;
            return reply.status(status).send({ error: err.message });
        }
    });

    // GET /api/v2/integrations/calendar/:connectionId/events
    app.get('/api/v2/integrations/calendar/:connectionId/events', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
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
                connectionId,
                clerkUserId,
                query.calendar_id,
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

    // POST /api/v2/integrations/calendar/:connectionId/availability
    app.post('/api/v2/integrations/calendar/:connectionId/availability', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
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
                connectionId,
                clerkUserId,
                body.calendar_ids,
                body.time_min,
                body.time_max,
            );
            return reply.send({ data: availability });
        } catch (err: any) {
            config.logger.error({ err, connectionId }, 'Failed to get availability');
            return reply.status(500).send({ error: err.message });
        }
    });

    // POST /api/v2/integrations/calendar/:connectionId/events
    app.post('/api/v2/integrations/calendar/:connectionId/events', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
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
            add_google_meet?: boolean; // backward compat — maps to add_video_conference
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
            config.logger.error({ err, connectionId }, 'Failed to create event');
            return reply.status(500).send({ error: err.message });
        }
    });
}
