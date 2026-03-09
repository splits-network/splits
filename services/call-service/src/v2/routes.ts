import { FastifyInstance } from 'fastify';
import { CallRepository } from './repository';
import { CallService } from './service';
import { TokenService } from './token-service';
import { requireUserContext } from './shared/helpers';
import { IEventPublisher } from './shared/events';
import { CallListFilters } from './types';
import { StandardListParams } from '@splits-network/shared-types';
import { registerCallActionRoutes } from './call-action-routes';

export interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    rabbitMqUrl: string;
    eventPublisher: IEventPublisher;
    livekitApiKey: string;
    livekitApiSecret: string;
    livekitWsUrl: string;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    const repository = new CallRepository(config.supabaseUrl, config.supabaseKey);
    const service = new CallService(repository, config.eventPublisher);
    const tokenService = new TokenService(
        repository,
        config.livekitApiKey,
        config.livekitApiSecret,
    );

    // ── POST /api/v2/calls/exchange-token — Public token exchange ───────
    app.post('/api/v2/calls/exchange-token', async (request, reply) => {
        try {
            const { token } = request.body as { token: string };
            const result = await tokenService.exchangeToken(token);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── GET /api/v2/calls/stats — Call stats (BEFORE /:id) ──────────────
    app.get('/api/v2/calls/stats', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const stats = await service.getStats(clerkUserId);
            return reply.send({ data: stats });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── GET /api/v2/calls/tags — List available tags (BEFORE /:id) ──────
    app.get('/api/v2/calls/tags', async (request, reply) => {
        try {
            requireUserContext(request);
            const tags = await service.listTags();
            return reply.send({ data: tags });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── GET /api/v2/calls — List calls ──────────────────────────────────
    app.get('/api/v2/calls', async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as Record<string, string>;

            const params: StandardListParams = {
                page: Math.max(parseInt(query.page || '1', 10), 1),
                limit: Math.min(parseInt(query.limit || '25', 10), 100),
                sort_by: query.sort_by || 'created_at',
                sort_order: (query.sort_order as 'asc' | 'desc') || 'desc',
            };

            const filters: CallListFilters = {
                call_type: query.call_type || undefined,
                entity_type: query.entity_type as any || undefined,
                entity_id: query.entity_id || undefined,
                status: query.status as any || undefined,
                date_from: query.date_from || undefined,
                date_to: query.date_to || undefined,
                tag: query.tag || undefined,
                needs_follow_up: query.needs_follow_up === 'true' || undefined,
                search: query.search || undefined,
            };

            const result = await service.listCalls(params, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── GET /api/v2/calls/:id — Get call detail ─────────────────────────
    app.get('/api/v2/calls/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const query = request.query as { include?: string };

            const includeArray = query.include
                ? query.include.split(',').map((s) => s.trim())
                : undefined;

            const call = await service.getCallDetail(id, includeArray);
            return reply.send({ data: call });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── POST /api/v2/calls — Create call ────────────────────────────────
    app.post('/api/v2/calls', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;

            const call = await service.createCall(
                {
                    call_type: body.call_type,
                    title: body.title,
                    scheduled_at: body.scheduled_at,
                    agenda: body.agenda,
                    duration_minutes_planned: body.duration_minutes_planned,
                    pre_call_notes: body.pre_call_notes,
                    tags: body.tags,
                    entity_links: body.entity_links || [],
                    participants: body.participants || [],
                },
                clerkUserId,
            );

            return reply.code(201).send({ data: call });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── PUT /api/v2/calls/:id — Update call ─────────────────────────────
    app.put('/api/v2/calls/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            const call = await service.updateCall(id, {
                title: body.title,
                scheduled_at: body.scheduled_at,
                agenda: body.agenda,
                needs_follow_up: body.needs_follow_up,
            });

            return reply.send({ data: call });
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // ── DELETE /api/v2/calls/:id — Soft delete call ─────────────────────
    app.delete('/api/v2/calls/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };

            await service.deleteCall(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(error.statusCode || 400).send({ error: error.message });
        }
    });

    // Register per-call action routes (start, end, cancel, reschedule, etc.)
    registerCallActionRoutes(app, service, tokenService);
}
