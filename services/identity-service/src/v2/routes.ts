/**
 * V2 Routes - Identity Service
 * All endpoints using standard 5-route pattern per resource
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '@splits-network/shared-logging';
import { RepositoryV2 } from './repository';
import { EventPublisherV2 } from './shared/events';
import { UserServiceV2 } from './services/user';
import { OrganizationServiceV2 } from './services/organization';
import { MembershipServiceV2 } from './services/membership';
import { InvitationServiceV2 } from './services/invitation';
import {
    requireUserContext,
    validatePaginationParams,
    buildPaginationResponse,
} from './shared/helpers';

export async function registerV2Routes(
    app: FastifyInstance,
    supabaseUrl: string,
    supabaseKey: string,
    eventPublisher: EventPublisherV2,
    logger: Logger
) {
    const repository = new RepositoryV2(supabaseUrl, supabaseKey);
    const userService = new UserServiceV2(repository, eventPublisher, logger);
    const orgService = new OrganizationServiceV2(repository, eventPublisher, logger);
    const membershipService = new MembershipServiceV2(repository, eventPublisher, logger);
    const invitationService = new InvitationServiceV2(repository, eventPublisher, logger);

    // ============================================
    // USERS - 5-ROUTE PATTERN
    // ============================================

    // LIST users
    app.get('/api/v2/users', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userContext = requireUserContext(request);
            const paginationParams = validatePaginationParams(request.query as any);

            const result = await userService.findUsers({
                ...paginationParams,
                search: (request.query as any).search,
                status: (request.query as any).status,
            });

            reply.send({
                data: result.data,
                pagination: buildPaginationResponse(
                    paginationParams.page,
                    paginationParams.limit,
                    result.total
                ),
            });
        } catch (error) {
            logger.error('GET /api/v2/users', error);
            reply.code(500).send({ error: { message: 'Failed to list users' } });
        }
    });

    // GET single user
    app.get('/api/v2/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userContext = requireUserContext(request);
            const { id } = request.params as { id: string };

            const user = await userService.findUserById(id);
            reply.send({ data: user });
        } catch (error) {
            logger.error('GET /api/v2/users/:id', error);
            reply.code(500).send({ error: { message: 'Failed to fetch user' } });
        }
    });

    // CREATE user
    app.post('/api/v2/users', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userContext = requireUserContext(request);
            const body = request.body as any;

            const user = await userService.createUser(body);
            reply.code(201).send({ data: user });
        } catch (error) {
            logger.error('POST /api/v2/users', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    // UPDATE user (PATCH)
    app.patch('/api/v2/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userContext = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            const user = await userService.updateUser(id, body);
            reply.send({ data: user });
        } catch (error) {
            logger.error('PATCH /api/v2/users/:id', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    // DELETE user
    app.delete('/api/v2/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userContext = requireUserContext(request);
            const { id } = request.params as { id: string };

            await userService.deleteUser(id);
            reply.code(204).send();
        } catch (error) {
            logger.error('DELETE /api/v2/users/:id', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    // ============================================
    // ORGANIZATIONS - 5-ROUTE PATTERN
    // ============================================

    // LIST organizations
    app.get(
        '/api/v2/organizations',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const paginationParams = validatePaginationParams(request.query as any);

                const result = await orgService.findOrganizations({
                    ...paginationParams,
                    search: (request.query as any).search,
                    status: (request.query as any).status,
                });

                reply.send({
                    data: result.data,
                    pagination: buildPaginationResponse(
                        paginationParams.page,
                        paginationParams.limit,
                        result.total
                    ),
                });
            } catch (error) {
                logger.error('GET /api/v2/organizations', error);
                reply.code(500).send({ error: { message: 'Failed to list organizations' } });
            }
        }
    );

    // GET single organization
    app.get(
        '/api/v2/organizations/:id',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const { id } = request.params as { id: string };

                const org = await orgService.findOrganizationById(id);
                reply.send({ data: org });
            } catch (error) {
                logger.error('GET /api/v2/organizations/:id', error);
                reply.code(500).send({ error: { message: 'Failed to fetch organization' } });
            }
        }
    );

    // CREATE organization
    app.post(
        '/api/v2/organizations',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const body = request.body as any;

                const org = await orgService.createOrganization(body);
                reply.code(201).send({ data: org });
            } catch (error) {
                logger.error('POST /api/v2/organizations', error);
                reply.code(400).send({ error: { message: (error as Error).message } });
            }
        }
    );

    // UPDATE organization (PATCH)
    app.patch(
        '/api/v2/organizations/:id',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const { id } = request.params as { id: string };
                const body = request.body as any;

                const org = await orgService.updateOrganization(id, body);
                reply.send({ data: org });
            } catch (error) {
                logger.error('PATCH /api/v2/organizations/:id', error);
                reply.code(400).send({ error: { message: (error as Error).message } });
            }
        }
    );

    // DELETE organization
    app.delete(
        '/api/v2/organizations/:id',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const { id } = request.params as { id: string };

                await orgService.deleteOrganization(id);
                reply.code(204).send();
            } catch (error) {
                logger.error('DELETE /api/v2/organizations/:id', error);
                reply.code(400).send({ error: { message: (error as Error).message } });
            }
        }
    );

    // ============================================
    // MEMBERSHIPS - 5-ROUTE PATTERN
    // ============================================

    // LIST memberships
    app.get(
        '/api/v2/memberships',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const paginationParams = validatePaginationParams(request.query as any);

                const result = await membershipService.findMemberships({
                    ...paginationParams,
                    organization_id: (request.query as any).organization_id,
                    user_id: (request.query as any).user_id,
                    role: (request.query as any).role,
                    status: (request.query as any).status,
                });

                reply.send({
                    data: result.data,
                    pagination: buildPaginationResponse(
                        paginationParams.page,
                        paginationParams.limit,
                        result.total
                    ),
                });
            } catch (error) {
                logger.error('GET /api/v2/memberships', error);
                reply.code(500).send({ error: { message: 'Failed to list memberships' } });
            }
        }
    );

    // GET single membership
    app.get(
        '/api/v2/memberships/:id',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const { id } = request.params as { id: string };

                const membership = await membershipService.findMembershipById(id);
                reply.send({ data: membership });
            } catch (error) {
                logger.error('GET /api/v2/memberships/:id', error);
                reply.code(500).send({ error: { message: 'Failed to fetch membership' } });
            }
        }
    );

    // CREATE membership
    app.post(
        '/api/v2/memberships',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const body = request.body as any;

                const membership = await membershipService.createMembership(body);
                reply.code(201).send({ data: membership });
            } catch (error) {
                logger.error('POST /api/v2/memberships', error);
                reply.code(400).send({ error: { message: (error as Error).message } });
            }
        }
    );

    // UPDATE membership (PATCH)
    app.patch(
        '/api/v2/memberships/:id',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const { id } = request.params as { id: string };
                const body = request.body as any;

                const membership = await membershipService.updateMembership(id, body);
                reply.send({ data: membership });
            } catch (error) {
                logger.error('PATCH /api/v2/memberships/:id', error);
                reply.code(400).send({ error: { message: (error as Error).message } });
            }
        }
    );

    // DELETE membership
    app.delete(
        '/api/v2/memberships/:id',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const { id } = request.params as { id: string };

                await membershipService.deleteMembership(id);
                reply.code(204).send();
            } catch (error) {
                logger.error('DELETE /api/v2/memberships/:id', error);
                reply.code(400).send({ error: { message: (error as Error).message } });
            }
        }
    );

    // ============================================
    // INVITATIONS - 5-ROUTE PATTERN
    // ============================================

    // LIST invitations
    app.get(
        '/api/v2/invitations',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const paginationParams = validatePaginationParams(request.query as any);

                const result = await invitationService.findInvitations({
                    ...paginationParams,
                    organization_id: (request.query as any).organization_id,
                    email: (request.query as any).email,
                    status: (request.query as any).status,
                });

                reply.send({
                    data: result.data,
                    pagination: buildPaginationResponse(
                        paginationParams.page,
                        paginationParams.limit,
                        result.total
                    ),
                });
            } catch (error) {
                logger.error('GET /api/v2/invitations', error);
                reply.code(500).send({ error: { message: 'Failed to list invitations' } });
            }
        }
    );

    // GET single invitation
    app.get(
        '/api/v2/invitations/:id',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const { id } = request.params as { id: string };

                const invitation = await invitationService.findInvitationById(id);
                reply.send({ data: invitation });
            } catch (error) {
                logger.error('GET /api/v2/invitations/:id', error);
                reply.code(500).send({ error: { message: 'Failed to fetch invitation' } });
            }
        }
    );

    // CREATE invitation
    app.post(
        '/api/v2/invitations',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const body = request.body as any;

                const invitation = await invitationService.createInvitation(body);
                reply.code(201).send({ data: invitation });
            } catch (error) {
                logger.error('POST /api/v2/invitations', error);
                reply.code(400).send({ error: { message: (error as Error).message } });
            }
        }
    );

    // UPDATE invitation (PATCH)
    app.patch(
        '/api/v2/invitations/:id',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const { id } = request.params as { id: string };
                const body = request.body as any;

                const invitation = await invitationService.updateInvitation(id, body);
                reply.send({ data: invitation });
            } catch (error) {
                logger.error('PATCH /api/v2/invitations/:id', error);
                reply.code(400).send({ error: { message: (error as Error).message } });
            }
        }
    );

    // DELETE invitation
    app.delete(
        '/api/v2/invitations/:id',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const userContext = requireUserContext(request);
                const { id } = request.params as { id: string };

                await invitationService.deleteInvitation(id);
                reply.code(204).send();
            } catch (error) {
                logger.error('DELETE /api/v2/invitations/:id', error);
                reply.code(400).send({ error: { message: (error as Error).message } });
            }
        }
    );
}
