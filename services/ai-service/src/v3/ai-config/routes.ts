/**
 * AI Config V3 Routes — Admin endpoints for model config, pricing, and usage
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import type { AiClient } from '@splits-network/shared-ai-client';
import type { AiModelConfigUpdate } from '@splits-network/shared-types';
import { AiConfigRepository } from './repository.js';
import { AiConfigService } from './service.js';

interface AiConfigRouteConfig {
    supabase: SupabaseClient;
    aiClient: AiClient;
}

function requireAdmin(request: { headers: Record<string, string | string[] | undefined> }): boolean {
    return request.headers['x-is-platform-admin'] === 'true';
}

export function registerAiConfigRoutes(app: FastifyInstance, config: AiConfigRouteConfig) {
    const repository = new AiConfigRepository(config.supabase);
    const service = new AiConfigService(repository, config.aiClient);

    // GET /admin/ai/configs
    app.get('/admin/ai/configs', async (request, reply) => {
        if (!requireAdmin(request)) {
            return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Platform admin access required' } });
        }
        const data = await service.listConfigs();
        return reply.send({ data });
    });

    // PATCH /admin/ai/configs/:operation
    app.patch('/admin/ai/configs/:operation', async (request, reply) => {
        if (!requireAdmin(request)) {
            return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Platform admin access required' } });
        }
        const { operation } = request.params as { operation: string };
        const patch = request.body as AiModelConfigUpdate;
        const data = await service.updateConfig(operation, patch);
        return reply.send({ data });
    });

    // POST /admin/ai/configs/:operation/test
    app.post('/admin/ai/configs/:operation/test', async (request, reply) => {
        if (!requireAdmin(request)) {
            return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Platform admin access required' } });
        }
        const { operation } = request.params as { operation: string };
        const data = await service.testConfig(operation);
        return reply.send({ data });
    });

    // GET /admin/ai/usage/stats
    app.get('/admin/ai/usage/stats', async (request, reply) => {
        if (!requireAdmin(request)) {
            return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Platform admin access required' } });
        }
        const { period = '30d' } = request.query as { period?: string };
        const validPeriods = ['7d', '30d', '90d', '1y'];
        if (!validPeriods.includes(period)) {
            return reply.status(400).send({
                error: { code: 'INVALID_PERIOD', message: `Period must be one of: ${validPeriods.join(', ')}` },
            });
        }
        const data = await service.getUsageStats(period);
        return reply.send({ data });
    });

    // GET /admin/ai/usage/logs
    app.get('/admin/ai/usage/logs', async (request, reply) => {
        if (!requireAdmin(request)) {
            return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Platform admin access required' } });
        }
        const query = request.query as {
            page?: string;
            limit?: string;
            operation?: string;
            service_name?: string;
            provider?: string;
        };
        const result = await service.getUsageLogs({
            page: query.page ? parseInt(query.page, 10) : undefined,
            limit: query.limit ? parseInt(query.limit, 10) : undefined,
            operation: query.operation,
            service_name: query.service_name,
            provider: query.provider,
        });
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = Math.min(query.limit ? parseInt(query.limit, 10) : 25, 100);
        return reply.send({
            data: result.data,
            pagination: {
                page,
                limit,
                total: result.total,
                total_pages: Math.ceil(result.total / limit),
            },
        });
    });

    // GET /admin/ai/pricing
    app.get('/admin/ai/pricing', async (request, reply) => {
        if (!requireAdmin(request)) {
            return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Platform admin access required' } });
        }
        const data = await service.listPricing();
        return reply.send({ data });
    });

    // PATCH /admin/ai/pricing/:id
    app.patch('/admin/ai/pricing/:id', async (request, reply) => {
        if (!requireAdmin(request)) {
            return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Platform admin access required' } });
        }
        const { id } = request.params as { id: string };
        const patch = request.body as Record<string, unknown>;
        const data = await service.updatePricing(id, patch);
        return reply.send({ data });
    });
}
