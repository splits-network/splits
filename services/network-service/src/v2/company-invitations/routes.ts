/**
 * Company Platform Invitations Routes - V2
 * REST endpoints for recruiter-to-company platform invitations
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyInvitationRepository } from './repository';
import { CompanyInvitationServiceV2 } from './service';
import { EventPublisherV2, IEventPublisher } from '../shared/events';
import { requireUserContext } from '../helpers';
import { StandardListParams } from '@splits-network/shared-types';
import {
    CompanyInvitationFilters,
    CreateCompanyInvitationRequest
} from './types';

const listSchema = {
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            search: { type: 'string' },
            sort_by: { type: 'string', enum: ['created_at', 'status', 'expires_at'] },
            sort_order: { type: 'string', enum: ['asc', 'desc'] },
            status: { type: 'string', enum: ['pending', 'accepted', 'expired', 'revoked'] }
        }
    }
};

const createSchema = {
    body: {
        type: 'object',
        properties: {
            invited_email: { type: 'string', format: 'email' },
            company_name_hint: { type: 'string', maxLength: 255 },
            personal_message: { type: 'string', maxLength: 1000 },
            send_email: { type: 'boolean', default: false }
        }
    }
};

const completeRelationshipSchema = {
    body: {
        type: 'object',
        required: ['invitation_id', 'company_id'],
        properties: {
            invitation_id: { type: 'string', format: 'uuid' },
            company_id: { type: 'string', format: 'uuid' }
        }
    }
};

const lookupSchema = {
    querystring: {
        type: 'object',
        properties: {
            code: { type: 'string' },
            token: { type: 'string', format: 'uuid' }
        }
    }
};

export async function companyInvitationRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher: IEventPublisher,
    portalUrl?: string
) {
    const repository = new CompanyInvitationRepository(supabase);
    const service = new CompanyInvitationServiceV2(repository, supabase, eventPublisher, portalUrl);

    // LIST invitations (authenticated, recruiters see their own)
    app.get('/api/v2/company-invitations', {
        schema: listSchema
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const params = request.query as StandardListParams & CompanyInvitationFilters;

        const result = await service.list(clerkUserId, params);
        return reply.send({ data: result.data, pagination: result.pagination });
    });

    // GET single invitation (authenticated)
    app.get('/api/v2/company-invitations/:id', {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id']
            }
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };

        try {
            const invitation = await service.getById(id, clerkUserId);
            return reply.send({ data: invitation });
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return reply.code(404).send({
                    error: { code: 'INVITATION_NOT_FOUND', message: error.message }
                });
            }
            throw error;
        }
    });

    // CREATE invitation (authenticated, recruiters only)
    app.post('/api/v2/company-invitations', {
        schema: createSchema
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const createRequest = request.body as CreateCompanyInvitationRequest;

        try {
            const invitation = await service.create(createRequest, clerkUserId);
            return reply.code(201).send({
                data: {
                    ...invitation,
                    invite_url: service.getInvitationUrl(invitation)
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Only recruiters')) {
                    return reply.code(403).send({
                        error: { code: 'FORBIDDEN', message: error.message }
                    });
                }
            }
            throw error;
        }
    });

    // PUBLIC LOOKUP by code or token (no auth required)
    app.get('/api/v2/company-invitations/lookup', async (request, reply) => {
        const { code, token } = request.query as { code?: string; token?: string };

        if (!code && !token) {
            return reply.code(400).send({
                error: { code: 'MISSING_PARAMETER', message: 'Either code or token is required' }
            });
        }

        try {
            const result = code
                ? await service.lookupByCode(code)
                : await service.lookupByToken(token!);

            return reply.send({ data: result });
        } catch (error) {
            console.error('Invitation lookup failed:', error);
            return reply.code(500).send({
                error: { code: 'LOOKUP_FAILED', message: 'Failed to lookup invitation' }
            });
        }
    });

    // ACCEPT invitation (authenticated) - sets onboarding state, doesn't create company
    app.post('/api/v2/company-invitations/:id/accept', {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id']
            }
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };

        try {
            const result = await service.accept(id, clerkUserId);
            return reply.send({ data: result });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    return reply.code(404).send({
                        error: { code: 'INVITATION_NOT_FOUND', message: error.message }
                    });
                }
                if (error.message.includes('already')) {
                    return reply.code(409).send({
                        error: { code: 'ALREADY_EXISTS', message: error.message }
                    });
                }
                if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('revoked')) {
                    return reply.code(400).send({
                        error: { code: 'INVALID_INVITATION', message: error.message }
                    });
                }
            }
            throw error;
        }
    });

    // COMPLETE RELATIONSHIP - called after onboarding creates the company
    app.post('/api/v2/company-invitations/complete-relationship', {
        schema: completeRelationshipSchema
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { invitation_id, company_id } = request.body as { invitation_id: string; company_id: string };

        try {
            const result = await service.completeRelationship(invitation_id, company_id, clerkUserId);
            return reply.send({ data: result });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    return reply.code(404).send({
                        error: { code: 'INVITATION_NOT_FOUND', message: error.message }
                    });
                }
            }
            throw error;
        }
    });

    // RESEND email (authenticated, owner only)
    app.post('/api/v2/company-invitations/:id/resend', {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id']
            }
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };

        try {
            await service.resendEmail(id, clerkUserId);
            return reply.send({ data: { message: 'Email sent successfully' } });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    return reply.code(404).send({
                        error: { code: 'INVITATION_NOT_FOUND', message: error.message }
                    });
                }
                if (error.message.includes('pending') || error.message.includes('No email')) {
                    return reply.code(400).send({
                        error: { code: 'INVALID_OPERATION', message: error.message }
                    });
                }
            }
            throw error;
        }
    });

    // REVOKE invitation (authenticated, owner only)
    app.patch('/api/v2/company-invitations/:id/revoke', {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id']
            }
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };

        try {
            await service.revoke(id, clerkUserId);
            return reply.send({ data: { message: 'Invitation revoked successfully' } });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    return reply.code(404).send({
                        error: { code: 'INVITATION_NOT_FOUND', message: error.message }
                    });
                }
                if (error.message.includes('pending')) {
                    return reply.code(400).send({
                        error: { code: 'INVALID_OPERATION', message: error.message }
                    });
                }
            }
            throw error;
        }
    });

    // DELETE invitation (authenticated, owner only)
    app.delete('/api/v2/company-invitations/:id', {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id']
            }
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };

        try {
            await service.delete(id, clerkUserId);
            return reply.send({ data: { message: 'Invitation deleted successfully' } });
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return reply.code(404).send({
                    error: { code: 'INVITATION_NOT_FOUND', message: error.message }
                });
            }
            throw error;
        }
    });
}
