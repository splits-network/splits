/**
 * Recruiter Codes Routes - V2
 * REST endpoints for recruiter referral code management
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCodeRepository } from './repository';
import { RecruiterCodeServiceV2 } from './service';
import { EventPublisherV2 } from '../shared/events';
import { requireUserContext } from '../helpers';
import { StandardListParams } from '@splits-network/shared-types';
import {
    RecruiterCodeFilters,
    CreateRecruiterCodeRequest,
    RecruiterCodeUpdate,
    LogCodeUsageRequest,
} from './types';

const listSchema = {
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            search: { type: 'string' },
            sort_by: { type: 'string', enum: ['created_at', 'status', 'code', 'label'] },
            sort_order: { type: 'string', enum: ['asc', 'desc'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
        },
    },
};

const createSchema = {
    body: {
        type: 'object',
        properties: {
            label: { type: 'string', maxLength: 255 },
        },
    },
};

const updateSchema = {
    body: {
        type: 'object',
        properties: {
            label: { type: 'string', maxLength: 255 },
            status: { type: 'string', enum: ['active', 'inactive'] },
        },
    },
};

const lookupSchema = {
    querystring: {
        type: 'object',
        required: ['code'],
        properties: {
            code: { type: 'string' },
        },
    },
};

const logUsageSchema = {
    body: {
        type: 'object',
        required: ['code'],
        properties: {
            code: { type: 'string' },
            signup_type: { type: 'string' },
            ip_address: { type: 'string' },
            user_agent: { type: 'string' },
        },
    },
};

export async function recruiterCodeRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher: EventPublisherV2
) {
    const repository = new RecruiterCodeRepository(supabase);
    const service = new RecruiterCodeServiceV2(repository, supabase, eventPublisher);

    // LIST codes (authenticated, recruiters see their own)
    app.get('/api/v2/recruiter-codes', {
        schema: listSchema,
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const params = request.query as StandardListParams & RecruiterCodeFilters;

        const result = await service.list(clerkUserId, params);
        return reply.send({ data: result.data, pagination: result.pagination });
    });

    // PUBLIC LOOKUP - no auth required (for signup flow)
    app.get('/api/v2/recruiter-codes/lookup', {
        schema: lookupSchema,
    }, async (request, reply) => {
        const { code } = request.query as { code: string };

        try {
            const result = await service.lookupByCode(code);
            return reply.send({ data: result });
        } catch (error) {
            console.error('Recruiter code lookup failed:', error);
            return reply.code(500).send({
                error: { code: 'LOOKUP_FAILED', message: 'Failed to lookup referral code' },
            });
        }
    });

    // GET single code (authenticated)
    app.get('/api/v2/recruiter-codes/:id', {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id'],
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };

        try {
            const code = await service.getById(id, clerkUserId);
            const usageCount = await service.getUsageCount(id);
            return reply.send({ data: { ...code, usage_count: usageCount } });
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return reply.code(404).send({
                    error: { code: 'NOT_FOUND', message: error.message },
                });
            }
            throw error;
        }
    });

    // CREATE code (authenticated, recruiters only)
    app.post('/api/v2/recruiter-codes', {
        schema: createSchema,
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const body = request.body as CreateRecruiterCodeRequest;

        try {
            const code = await service.create(body, clerkUserId);
            return reply.code(201).send({ data: code });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Only recruiters')) {
                    return reply.code(403).send({
                        error: { code: 'FORBIDDEN', message: error.message },
                    });
                }
            }
            throw error;
        }
    });

    // UPDATE code (authenticated, owner only)
    app.patch('/api/v2/recruiter-codes/:id', {
        schema: {
            ...updateSchema,
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id'],
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        const updates = request.body as RecruiterCodeUpdate;

        try {
            const code = await service.update(id, updates, clerkUserId);
            return reply.send({ data: code });
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return reply.code(404).send({
                    error: { code: 'NOT_FOUND', message: error.message },
                });
            }
            throw error;
        }
    });

    // DELETE code (authenticated, owner only)
    app.delete('/api/v2/recruiter-codes/:id', {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id'],
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };

        try {
            await service.delete(id, clerkUserId);
            return reply.code(204).send();
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return reply.code(404).send({
                    error: { code: 'NOT_FOUND', message: error.message },
                });
            }
            throw error;
        }
    });

    // LOG code usage (authenticated, called at signup)
    app.post('/api/v2/recruiter-codes/log', {
        schema: logUsageSchema,
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const body = request.body as LogCodeUsageRequest;

        try {
            const logEntry = await service.logCodeUsage(body, clerkUserId);
            return reply.code(201).send({ data: logEntry });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    return reply.code(404).send({
                        error: { code: 'CODE_NOT_FOUND', message: error.message },
                    });
                }
                if (error.message.includes('no longer active')) {
                    return reply.code(400).send({
                        error: { code: 'CODE_INACTIVE', message: error.message },
                    });
                }
            }
            throw error;
        }
    });

    // GET usage log (authenticated, recruiters see their own)
    app.get('/api/v2/recruiter-codes/log', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'integer', minimum: 1 },
                    limit: { type: 'integer', minimum: 1, maximum: 100 },
                    recruiter_code_id: { type: 'string', format: 'uuid' },
                },
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const params = request.query as StandardListParams & { recruiter_code_id?: string };

        const result = await service.getUsageLog(clerkUserId, params);
        return reply.send({ data: result.data, pagination: result.pagination });
    });
}
