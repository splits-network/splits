import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { SupportRepository } from './repository';
import { SupportServiceV2 } from './service';
import { SupportEventPublisher } from './events';
import { requireSupportIdentity, requireAdminContext, getSupportContext } from '../shared/helpers';

interface RegisterSupportRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    redisConfig: { host: string; port: number; password?: string };
}

export async function registerSupportRoutes(
    app: FastifyInstance,
    config: RegisterSupportRoutesConfig,
) {
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);
    const repository = new SupportRepository(supabase);
    const eventPublisher = new SupportEventPublisher(config.redisConfig, app.log as any);
    const service = new SupportServiceV2(repository, eventPublisher, supabase);

    app.addHook('onClose', async () => {
        await eventPublisher.close();
    });

    // ── Public: no auth required ──

    app.get('/api/v2/support/admin-status', async (_request, reply) => {
        const online = await service.checkAdminOnline();
        return reply.send({ data: { online } });
    });

    // ── Visitor endpoints (auth optional) ──

    app.post('/api/v2/support/conversations', async (request, reply) => {
        try {
            const ctx = requireSupportIdentity(request);
            const body = request.body as any;

            const result = await service.createConversation({
                sessionId: body.sessionId,
                clerkUserId: ctx.clerkUserId,
                category: body.category,
                subject: body.subject,
                body: body.body,
                visitorName: body.visitorName,
                visitorEmail: body.visitorEmail,
                sourceApp: body.sourceApp,
                pageUrl: body.pageUrl,
                userAgent: body.userAgent,
            });

            return reply.code(201).send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get('/api/v2/support/conversations/mine', async (request, reply) => {
        try {
            const ctx = requireSupportIdentity(request);
            const query = request.query as any;
            const conversations = await service.getVisitorConversations(
                ctx.sessionId || query.sessionId,
                ctx.clerkUserId,
            );
            return reply.send({ data: conversations });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get('/api/v2/support/conversations/:id/messages', async (request, reply) => {
        try {
            requireSupportIdentity(request);
            const { id } = request.params as { id: string };
            const query = request.query as any;
            const limit = Math.min(parseInt(query.limit || '50', 10), 100);
            const before = query.before as string | undefined;
            const messages = await service.listMessages(id, limit, before);
            return reply.send({ data: messages });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post('/api/v2/support/conversations/:id/messages', async (request, reply) => {
        try {
            const ctx = requireSupportIdentity(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            const message = await service.sendVisitorMessage(
                id,
                null, // senderId resolved in repository if needed
                body.body,
            );
            return reply.code(201).send({ data: message });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post('/api/v2/support/conversations/link-session', async (request, reply) => {
        try {
            const ctx = getSupportContext(request);
            if (!ctx.clerkUserId || !ctx.sessionId) {
                return reply.code(400).send({ error: 'Both clerkUserId and sessionId required' });
            }
            await service.linkSession(ctx.sessionId, ctx.clerkUserId);
            return reply.send({ data: { status: 'ok' } });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // ── V3 aliases — same handlers, V3 paths for frontend migration ──

    app.get('/api/v3/public/support/admin-status', async (_request, reply) => {
        const online = await service.checkAdminOnline();
        return reply.send({ data: { online } });
    });

    app.get('/api/v3/support/conversations/mine', async (request, reply) => {
        try {
            const ctx = requireSupportIdentity(request);
            const query = request.query as any;
            const conversations = await service.getVisitorConversations(
                ctx.sessionId || query.sessionId,
                ctx.clerkUserId,
            );
            return reply.send({ data: conversations });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get('/api/v3/support/conversations/:id/messages', async (request, reply) => {
        try {
            requireSupportIdentity(request);
            const { id } = request.params as { id: string };
            const query = request.query as any;
            const limit = Math.min(parseInt(query.limit || '50', 10), 100);
            const before = query.before as string | undefined;
            const messages = await service.listMessages(id, limit, before);
            return reply.send({ data: messages });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post('/api/v3/support/conversations/:id/messages', async (request, reply) => {
        try {
            const ctx = requireSupportIdentity(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            const message = await service.sendVisitorMessage(
                id,
                null,
                body.body,
            );
            return reply.code(201).send({ data: message });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post('/api/v3/support/conversations/link-session', async (request, reply) => {
        try {
            const ctx = getSupportContext(request);
            if (!ctx.clerkUserId || !ctx.sessionId) {
                return reply.code(400).send({ error: 'Both clerkUserId and sessionId required' });
            }
            await service.linkSession(ctx.sessionId, ctx.clerkUserId);
            return reply.send({ data: { status: 'ok' } });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    // ── Admin endpoints (routed via admin-gateway) ──

    app.get('/admin/support/conversations', async (request, reply) => {
        try {
            requireAdminContext(request);
            const query = request.query as any;
            const limit = Math.min(parseInt(query.limit || '25', 10), 100);
            const cursor = query.cursor as string | undefined;
            const status = query.status as string | undefined;
            const category = query.category as string | undefined;

            const result = await service.listAllConversations({
                status: status as any,
                category,
                limit,
                cursor,
            });

            return reply.send({
                data: result.data,
                pagination: { total: result.total, limit, cursor },
            });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get('/admin/support/conversations/:id', async (request, reply) => {
        try {
            requireAdminContext(request);
            const { id } = request.params as { id: string };
            const conversation = await service.getConversation(id);
            if (!conversation) {
                return reply.code(404).send({ error: 'Conversation not found' });
            }
            const messages = await service.listMessages(id, 100);
            return reply.send({ data: { conversation, messages } });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.get('/admin/support/conversations/:id/messages', async (request, reply) => {
        try {
            requireAdminContext(request);
            const { id } = request.params as { id: string };
            const query = request.query as any;
            const limit = Math.min(parseInt(query.limit || '50', 10), 100);
            const before = query.before as string | undefined;
            const messages = await service.listMessages(id, limit, before);
            return reply.send({ data: messages });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post('/admin/support/conversations/:id/messages', async (request, reply) => {
        try {
            const { clerkUserId } = requireAdminContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;
            const message = await service.sendAdminMessage(id, clerkUserId, body.body);
            return reply.code(201).send({ data: message });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.patch('/admin/support/conversations/:id', async (request, reply) => {
        try {
            requireAdminContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;
            const conversation = await service.updateConversationStatus(id, body.status);
            return reply.send({ data: conversation });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });

    app.post('/admin/support/conversations/:id/claim', async (request, reply) => {
        try {
            const { clerkUserId } = requireAdminContext(request);
            const { id } = request.params as { id: string };
            const conversation = await service.claimConversation(id, clerkUserId);
            return reply.send({ data: conversation });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: error.message });
        }
    });
}
