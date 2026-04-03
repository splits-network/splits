import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { EventPublisher, IEventPublisher } from '../shared/events.js';
import { SupportEventPublisher } from '../support/events.js';
import { TicketRepository } from './repository.js';
import { TicketService } from './service.js';
import { requireSupportIdentity, requireAdminContext } from '../shared/helpers.js';

interface RegisterTicketRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    redisConfig: { host: string; port: number; password?: string };
    rabbitMqUrl?: string;
}

export async function registerTicketRoutes(
    app: FastifyInstance,
    config: RegisterTicketRoutesConfig,
) {
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);
    const repository = new TicketRepository(supabase);
    const realtimePublisher = new SupportEventPublisher(config.redisConfig, app.log as any);

    // Connect RabbitMQ event publisher if URL is available
    let eventPublisher: IEventPublisher | null = null;
    if (config.rabbitMqUrl) {
        try {
            const publisher = new EventPublisher(config.rabbitMqUrl, app.log as any, 'support-service');
            await publisher.connect();
            eventPublisher = publisher;
            app.log.info('Ticket routes: RabbitMQ event publisher connected');
        } catch (err) {
            app.log.warn({ err }, 'Ticket routes: Failed to connect RabbitMQ, email notifications disabled');
        }
    }

    const service = new TicketService(repository, eventPublisher, realtimePublisher, supabase);

    // ── Visitor endpoints ──

    app.post('/api/v2/support/tickets', async (request, reply) => {
        try {
            const ctx = requireSupportIdentity(request);
            const body = request.body as any;

            const ticket = await service.createTicket({
                sessionId: body.sessionId,
                clerkUserId: ctx.clerkUserId,
                category: body.category || 'question',
                subject: body.subject,
                body: body.body,
                visitorName: body.visitorName,
                visitorEmail: body.visitorEmail,
                sourceApp: body.sourceApp,
                pageUrl: body.pageUrl,
                userAgent: body.userAgent,
            });

            return reply.code(201).send({ data: ticket });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get('/api/v2/support/tickets/mine', async (request, reply) => {
        try {
            const ctx = requireSupportIdentity(request);
            const query = request.query as any;
            const tickets = await service.getVisitorTickets(
                ctx.sessionId || query.sessionId,
                ctx.clerkUserId,
            );
            return reply.send({ data: tickets });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // ── Admin endpoints (routed via admin-gateway) ──

    app.get('/admin/support/tickets', async (request, reply) => {
        try {
            requireAdminContext(request);
            const query = request.query as any;
            const limit = Math.min(parseInt(query.limit || '25', 10), 100);
            const page = Math.max(parseInt(query.page || '1', 10), 1);

            const result = await service.listAllTickets({
                status: query.status || undefined,
                category: query.category || undefined,
                limit,
                page,
                search: query.search || undefined,
            });

            const totalPages = Math.ceil(result.total / limit);

            return reply.send({
                data: result.data,
                pagination: {
                    total: result.total,
                    page,
                    limit,
                    total_pages: totalPages,
                },
            });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get('/admin/support/tickets/counts', async (request, reply) => {
        try {
            requireAdminContext(request);
            const counts = await service.getTicketCounts();
            return reply.send({ data: counts });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get('/admin/support/tickets/:id', async (request, reply) => {
        try {
            requireAdminContext(request);
            const { id } = request.params as { id: string };
            const result = await service.getTicketWithReplies(id);

            if (!result) {
                return reply.code(404).send({ error: 'Ticket not found' });
            }

            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.patch('/admin/support/tickets/:id', async (request, reply) => {
        try {
            requireAdminContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            let ticket;
            if (body.status) {
                ticket = await service.updateTicketStatus(id, body.status);
            }
            if (body.admin_notes !== undefined) {
                ticket = await service.updateTicketNotes(id, body.admin_notes);
            }

            if (!ticket) {
                return reply.code(400).send({ error: 'No valid update fields provided' });
            }

            return reply.send({ data: ticket });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post('/admin/support/tickets/:id/reply', async (request, reply) => {
        try {
            const { clerkUserId } = requireAdminContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            const ticketReply = await service.replyToTicket(id, clerkUserId, body.body);
            return reply.code(201).send({ data: ticketReply });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post('/admin/support/tickets/:id/claim', async (request, reply) => {
        try {
            const { clerkUserId } = requireAdminContext(request);
            const { id } = request.params as { id: string };

            const ticket = await service.claimTicket(id, clerkUserId);
            return reply.send({ data: ticket });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });
}
