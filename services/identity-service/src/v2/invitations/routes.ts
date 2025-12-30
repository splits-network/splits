import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { InvitationServiceV2 } from './service';
import {
    requireUserContext,
    validatePaginationParams,
    buildPaginationResponse,
} from '../shared/helpers';

interface RegisterInvitationRoutesConfig {
    invitationService: InvitationServiceV2;
    logError: (message: string, error: unknown) => void;
}

export function registerInvitationRoutes(
    app: FastifyInstance,
    config: RegisterInvitationRoutesConfig
) {
    const { invitationService, logError } = config;

    app.get('/api/v2/invitations', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const paginationParams = validatePaginationParams(request.query as any);

            const result = await invitationService.findInvitations(clerkUserId, {
                ...paginationParams,
                organization_id: (request.query as any).organization_id,
                status: (request.query as any).status,
                email: (request.query as any).email,
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
            logError('GET /api/v2/invitations failed', error);
            reply.code(500).send({ error: { message: 'Failed to list invitations' } });
        }
    });

    app.get('/api/v2/invitations/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            const invite = await invitationService.findInvitationById(clerkUserId, id);
            reply.send({ data: invite });
        } catch (error) {
            logError('GET /api/v2/invitations/:id failed', error);
            reply.code(500).send({ error: { message: 'Failed to fetch invitation' } });
        }
    });

    app.post('/api/v2/invitations', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;

            const invite = await invitationService.createInvitation(clerkUserId, body);
            reply.code(201).send({ data: invite });
        } catch (error) {
            logError('POST /api/v2/invitations failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    app.patch('/api/v2/invitations/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            const invite = await invitationService.updateInvitation(clerkUserId, id, body);
            reply.send({ data: invite });
        } catch (error) {
            logError('PATCH /api/v2/invitations/:id failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    app.delete('/api/v2/invitations/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            await invitationService.deleteInvitation(clerkUserId, id);
            reply.code(204).send();
        } catch (error) {
            logError('DELETE /api/v2/invitations/:id failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });
}
