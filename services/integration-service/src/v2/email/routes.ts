import { FastifyInstance } from 'fastify';
import { ConnectionRepository } from '../connections/repository';
import { TokenRefreshService } from '../calendar/token-refresh';
import { EmailService, SendEmailParams } from './service';
import { IEventPublisher } from '../shared/events';
import { requireUserContext } from '../shared/helpers';
import { Logger } from '@splits-network/shared-logging';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: IEventPublisher;
    logger: Logger;
}

export async function registerEmailRoutes(app: FastifyInstance, config: RegisterConfig) {
    const connectionRepo = new ConnectionRepository(config.supabaseUrl, config.supabaseKey);
    const tokenRefresh = new TokenRefreshService(connectionRepo, config.eventPublisher, config.logger);
    const service = new EmailService(connectionRepo, tokenRefresh, config.logger);

    // GET /api/v2/integrations/email/:connectionId/messages
    app.get('/api/v2/integrations/email/:connectionId/messages', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { connectionId } = request.params as { connectionId: string };
        const query = request.query as {
            q?: string;
            max_results?: string;
            page_token?: string;
        };

        try {
            const result = await service.listMessages(connectionId, clerkUserId, {
                query: query.q,
                maxResults: query.max_results ? parseInt(query.max_results, 10) : 25,
                pageToken: query.page_token,
            });
            return reply.send({ data: result });
        } catch (err: any) {
            config.logger.error({ err, connectionId }, 'Failed to list messages');
            const status = err.message.includes('Unauthorized') ? 403
                : err.message.includes('not found') ? 404
                : err.message.includes('expired') ? 401
                : 500;
            return reply.status(status).send({ error: err.message });
        }
    });

    // GET /api/v2/integrations/email/:connectionId/messages/:messageId
    app.get('/api/v2/integrations/email/:connectionId/messages/:messageId', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { connectionId, messageId } = request.params as { connectionId: string; messageId: string };

        try {
            const message = await service.getMessage(connectionId, clerkUserId, messageId);
            return reply.send({ data: message });
        } catch (err: any) {
            config.logger.error({ err, connectionId, messageId }, 'Failed to get message');
            const status = err.message.includes('Unauthorized') ? 403
                : err.message.includes('not found') ? 404
                : err.message.includes('expired') ? 401
                : 500;
            return reply.status(status).send({ error: err.message });
        }
    });

    // GET /api/v2/integrations/email/:connectionId/threads/:threadId
    app.get('/api/v2/integrations/email/:connectionId/threads/:threadId', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { connectionId, threadId } = request.params as { connectionId: string; threadId: string };

        try {
            const thread = await service.getThread(connectionId, clerkUserId, threadId);
            return reply.send({ data: thread });
        } catch (err: any) {
            config.logger.error({ err, connectionId, threadId }, 'Failed to get thread');
            const status = err.message.includes('Unauthorized') ? 403
                : err.message.includes('not found') ? 404
                : err.message.includes('expired') ? 401
                : 500;
            return reply.status(status).send({ error: err.message });
        }
    });

    // POST /api/v2/integrations/email/:connectionId/messages/send
    app.post('/api/v2/integrations/email/:connectionId/messages/send', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { connectionId } = request.params as { connectionId: string };
        const body = request.body as {
            to: string[];
            cc?: string[];
            bcc?: string[];
            subject: string;
            body: string;
            body_type?: 'text' | 'html';
            in_reply_to?: string;
            thread_id?: string;
        };

        if (!body.to?.length || !body.subject || !body.body) {
            return reply.status(400).send({
                error: 'to, subject, and body are required',
            });
        }

        try {
            const params: SendEmailParams = {
                to: body.to,
                cc: body.cc,
                bcc: body.bcc,
                subject: body.subject,
                body: body.body,
                bodyType: body.body_type,
                inReplyTo: body.in_reply_to,
                threadId: body.thread_id,
            };
            const message = await service.sendMessage(connectionId, clerkUserId, params);
            return reply.status(201).send({ data: message });
        } catch (err: any) {
            config.logger.error({ err, connectionId }, 'Failed to send message');
            const status = err.message.includes('Unauthorized') ? 403
                : err.message.includes('not found') ? 404
                : err.message.includes('expired') ? 401
                : 500;
            return reply.status(status).send({ error: err.message });
        }
    });
}
