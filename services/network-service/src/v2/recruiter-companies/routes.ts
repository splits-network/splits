/**
 * Recruiter-Companies Routes - V2
 * REST endpoints for recruiter-company relationship management
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCompanyRepository } from './repository';
import { RecruiterCompanyServiceV2 } from './service';
import { EventPublisherV2, IEventPublisher } from '../shared/events';
import { RecruiterActivityService } from '../recruiter-activity/service';
import { requireUserContext } from '../helpers';
import { StandardListParams } from '@splits-network/shared-types';
import {
    RecruiterCompanyFilters,
    InviteRecruiterRequest,
    AcceptInvitationRequest,
    TerminateRelationshipRequest,
    RecruiterCompanyUpdate,
    RequestConnectionRequest
} from './types';

const listSchema = {
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            search: { type: 'string' },
            sort_by: { type: 'string', enum: ['created_at', 'status', 'recruiter_name', 'company_name'] },
            sort_order: { type: 'string', enum: ['asc', 'desc'] },
            // Filters
            recruiter_id: { type: 'string', format: 'uuid' },
            company_id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['pending', 'active', 'declined', 'terminated'] },
            relationship_type: { type: 'string', enum: ['sourcer', 'recruiter'] },
        }
    }
};

const permissionsSchema = {
    type: 'object',
    properties: {
        can_view_jobs: { type: 'boolean' },
        can_create_jobs: { type: 'boolean' },
        can_edit_jobs: { type: 'boolean' },
        can_advance_candidates: { type: 'boolean' },
        can_view_applications: { type: 'boolean' },
        can_submit_candidates: { type: 'boolean' },
    }
};

const inviteSchema = {
    body: {
        type: 'object',
        required: ['company_id', 'recruiter_id'],
        properties: {
            company_id: { type: 'string', format: 'uuid' },
            recruiter_id: { type: 'string', format: 'uuid' },
            relationship_type: { type: 'string', enum: ['sourcer', 'recruiter'], default: 'recruiter' },
            permissions: permissionsSchema,
            message: { type: 'string', maxLength: 500 }
        }
    }
};

const respondSchema = {
    body: {
        type: 'object',
        required: ['accept'],
        properties: {
            accept: { type: 'boolean' },
            permissions: permissionsSchema
        }
    }
};

const terminateSchema = {
    body: {
        type: 'object',
        properties: {
            reason: { type: 'string', maxLength: 500 }
        }
    }
};

const updateSchema = {
    body: {
        type: 'object',
        properties: {
            permissions: permissionsSchema,
            status: { type: 'string', enum: ['active', 'terminated'] }
        }
    }
};

export async function recruiterCompanyRoutes(
    app: FastifyInstance,
    supabase: SupabaseClient,
    eventPublisher: IEventPublisher,
    activityService?: RecruiterActivityService
) {
    const repository = new RecruiterCompanyRepository(supabase);
    const service = new RecruiterCompanyServiceV2(repository, supabase, eventPublisher, activityService);

    // LIST relationships
    app.get('/api/v2/recruiter-companies', {
        schema: listSchema
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const params = request.query as StandardListParams & RecruiterCompanyFilters;
        
        const result = await service.list(clerkUserId, params);
        return reply.send({ data: result.data, pagination: result.pagination });
    });

    // GET relationship by ID
    app.get('/api/v2/recruiter-companies/:id', {
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
            const relationship = await service.getById(id, clerkUserId);
            return reply.send({ data: relationship });
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return reply.code(404).send({ 
                    error: { code: 'RELATIONSHIP_NOT_FOUND', message: error.message } 
                });
            }
            throw error;
        }
    });

    // CREATE - Recruiter requests connection with a company
    app.post('/api/v2/recruiter-companies/request-connection', {
        schema: {
            body: {
                type: 'object',
                required: ['company_id'],
                properties: {
                    company_id: { type: 'string', format: 'uuid' },
                    message: { type: 'string', maxLength: 500 },
                    relationship_type: { type: 'string', enum: ['sourcer', 'recruiter'], default: 'recruiter' }
                }
            }
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const connectionRequest = request.body as RequestConnectionRequest;

        try {
            const relationship = await service.requestConnection(connectionRequest, clerkUserId);
            return reply.code(201).send({ data: relationship });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    return reply.code(404).send({
                        error: { code: 'COMPANY_NOT_FOUND', message: error.message }
                    });
                }
                if (error.message.includes('already exists')) {
                    return reply.code(409).send({
                        error: { code: 'RELATIONSHIP_EXISTS', message: error.message }
                    });
                }
                if (error.message.includes('Only recruiters')) {
                    return reply.code(403).send({
                        error: { code: 'FORBIDDEN', message: error.message }
                    });
                }
            }
            throw error;
        }
    });

    // CREATE - Invite recruiter to work with company
    app.post('/api/v2/recruiter-companies/invite', {
        schema: inviteSchema
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const inviteRequest = request.body as InviteRecruiterRequest;
        
        try {
            const relationship = await service.inviteRecruiter(inviteRequest, clerkUserId);
            return reply.code(201).send({ data: relationship });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('already')) {
                    return reply.code(409).send({
                        error: { code: 'RELATIONSHIP_EXISTS', message: error.message }
                    });
                }
                if (error.message.includes('Forbidden')) {
                    return reply.code(403).send({
                        error: { code: 'FORBIDDEN', message: error.message }
                    });
                }
            }
            throw error;
        }
    });

    // PATCH - Respond to invitation
    app.patch('/api/v2/recruiter-companies/:id/respond', {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id']
            },
            ...respondSchema
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        const { accept, permissions } = request.body as AcceptInvitationRequest;

        try {
            const relationship = await service.respondToInvitation(id, accept, clerkUserId, permissions);
            return reply.send({ data: relationship });
        } catch (error: any) {
            // Log the full error for debugging
            console.error('[RESPOND_TO_INVITATION] Error:', {
                id,
                accept,
                clerkUserId,
                errorMessage: error?.message,
                errorCode: error?.code,
                errorDetails: error?.details,
                errorHint: error?.hint
            });

            if (error instanceof Error) {
                if (error.message.includes('not found') || error.message.includes('access denied')) {
                    return reply.code(404).send({
                        error: { code: 'INVITATION_NOT_FOUND', message: error.message }
                    });
                }
                if (error.message.includes('already responded') || error.message.includes('only respond')) {
                    return reply.code(400).send({
                        error: { code: 'INVALID_RESPONSE', message: error.message }
                    });
                }
            }
            // Handle database constraint violations (Postgres error code 23505)
            if (error?.code === '23505' || error?.message?.includes('unique') ||
                error?.message?.includes('duplicate') || error?.message?.includes('violates')) {
                return reply.code(409).send({
                    error: {
                        code: 'RELATIONSHIP_CONFLICT',
                        message: 'An active relationship already exists for this recruiter and company'
                    }
                });
            }
            throw error;
        }
    });

    // PATCH - Update relationship
    app.patch('/api/v2/recruiter-companies/:id', {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id']
            },
            ...updateSchema
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        const updates = request.body as RecruiterCompanyUpdate;
        
        try {
            const relationship = await service.update(id, updates, clerkUserId);
            return reply.send({ data: relationship });
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return reply.code(404).send({ 
                    error: { code: 'RELATIONSHIP_NOT_FOUND', message: error.message } 
                });
            }
            throw error;
        }
    });

    // PATCH - Terminate relationship
    app.patch('/api/v2/recruiter-companies/:id/terminate', {
        schema: {
            params: {
                type: 'object',
                properties: { id: { type: 'string', format: 'uuid' } },
                required: ['id']
            },
            ...terminateSchema
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        const terminateRequest = request.body as TerminateRelationshipRequest;
        
        try {
            const relationship = await service.terminateRelationship(id, terminateRequest, clerkUserId);
            return reply.send({ data: relationship });
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return reply.code(404).send({ 
                    error: { code: 'RELATIONSHIP_NOT_FOUND', message: error.message } 
                });
            }
            throw error;
        }
    });

    // DELETE relationship
    app.delete('/api/v2/recruiter-companies/:id', {
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
            return reply.send({ data: { message: 'Relationship deleted successfully' } });
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return reply.code(404).send({ 
                    error: { code: 'RELATIONSHIP_NOT_FOUND', message: error.message } 
                });
            }
            throw error;
        }
    });

    // GET all permissions for the current recruiter across all active companies
    app.get('/api/v2/recruiter-companies/my-permissions', {
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (!user) {
            return reply.send({ data: [] });
        }

        const { data: recruiter } = await supabase
            .from('recruiters')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!recruiter) {
            return reply.send({ data: [] });
        }

        const permissions = await service.getAllPermissionsForRecruiter(recruiter.id);
        return reply.send({ data: permissions });
    });

    // GET permissions for the current recruiter for a specific company
    app.get('/api/v2/recruiter-companies/my-permissions/:companyId', {
        schema: {
            params: {
                type: 'object',
                properties: { companyId: { type: 'string', format: 'uuid' } },
                required: ['companyId']
            }
        }
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { companyId } = request.params as { companyId: string };

        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (!user) {
            return reply.send({ data: null });
        }

        const { data: recruiter } = await supabase
            .from('recruiters')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!recruiter) {
            return reply.send({ data: null });
        }

        const permissions = await service.getPermissions(recruiter.id, companyId);

        return reply.send({ data: permissions });
    });
}