import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { MembershipServiceV2 } from './service';
import {
    requireUserContext,
    validatePaginationParams,
    buildPaginationResponse,
} from '../shared/helpers';

interface RegisterMembershipRoutesConfig {
    membershipService: MembershipServiceV2;
    logError: (message: string, error: unknown) => void;
}

export function registerMembershipRoutes(
    app: FastifyInstance,
    config: RegisterMembershipRoutesConfig
) {
    const { membershipService, logError } = config;

    app.get('/api/v2/memberships', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const paginationParams = validatePaginationParams(request.query as any);

            const result = await membershipService.findMemberships(clerkUserId, {
                ...paginationParams,
                user_id: (request.query as any).user_id,
                organization_id: (request.query as any).organization_id,
                role: (request.query as any).role,
            });

            reply.send(
                buildPaginationResponse(
                    result.data,
                    result.total,
                    paginationParams.page,
                    paginationParams.limit
                )
            );
        } catch (error) {
            logError('GET /api/v2/memberships failed', error);
            reply.code(500).send({ error: { message: 'Failed to list memberships' } });
        }
    });

    app.get('/api/v2/memberships/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            const membership = await membershipService.findMembershipById(clerkUserId, id);
            reply.send({ data: membership });
        } catch (error) {
            logError('GET /api/v2/memberships/:id failed', error);
            reply.code(500).send({ error: { message: 'Failed to fetch membership' } });
        }
    });

    app.post('/api/v2/memberships', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;

            const membership = await membershipService.createMembership(clerkUserId, body);
            reply.code(201).send({ data: membership });
        } catch (error) {
            logError('POST /api/v2/memberships failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    app.patch('/api/v2/memberships/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            const membership = await membershipService.updateMembership(clerkUserId, id, body);
            reply.send({ data: membership });
        } catch (error) {
            logError('PATCH /api/v2/memberships/:id failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    app.delete('/api/v2/memberships/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            await membershipService.deleteMembership(clerkUserId, id);
            reply.code(204).send();
        } catch (error) {
            logError('DELETE /api/v2/memberships/:id failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });
}
