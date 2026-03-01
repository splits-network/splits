/**
 * Firm Routes
 * Fastify handlers for firms, members, and invitations
 */

import { FastifyInstance } from 'fastify';
import { FirmServiceV2 } from './service';
import { requireUserContext } from '../shared/helpers';
import { validatePaginationParams } from '../shared/pagination';

interface RegisterFirmRoutesConfig {
    firmService: FirmServiceV2;
}

export function registerFirmRoutes(
    app: FastifyInstance,
    config: RegisterFirmRoutesConfig
) {
    // ── Firms CRUD ──

    // LIST firms
    app.get('/api/v2/firms', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;

            const pagination = validatePaginationParams(
                query.page ? Number(query.page) : undefined,
                query.limit ? Number(query.limit) : undefined
            );

            const filters = {
                ...pagination,
                search: query.search,
                status: query.status,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await config.firmService.getFirms(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // GET single firm
    app.get('/api/v2/firms/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const firm = await config.firmService.getFirm(id);
            return reply.send({ data: firm });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // CREATE firm
    app.post('/api/v2/firms', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const firm = await config.firmService.createFirm(body, clerkUserId);
            return reply.code(201).send({ data: firm });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // UPDATE firm
    app.patch('/api/v2/firms/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const firm = await config.firmService.updateFirm(id, updates, clerkUserId);
            return reply.send({ data: firm });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // DELETE firm (soft delete)
    app.delete('/api/v2/firms/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await config.firmService.deleteFirm(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // ── Firm Members ──

    // LIST members
    app.get('/api/v2/firms/:firmId/members', async (request, reply) => {
        try {
            const { firmId } = request.params as { firmId: string };
            const query = request.query as any;

            const pagination = validatePaginationParams(
                query.page ? Number(query.page) : undefined,
                query.limit ? Number(query.limit) : undefined
            );

            const filters = {
                ...pagination,
                status: query.status,
                role: query.role,
            };

            const result = await config.firmService.getFirmMembers(firmId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // REMOVE member (soft delete)
    app.delete('/api/v2/firms/:firmId/members/:memberId', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId, memberId } = request.params as { firmId: string; memberId: string };
            await config.firmService.removeFirmMember(firmId, memberId, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // ── Invitations ──

    // CREATE invitation
    app.post('/api/v2/firms/:firmId/invitations', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const body = request.body as any;
            const invitation = await config.firmService.createFirmInvitation(firmId, body, clerkUserId);
            return reply.code(201).send({ data: invitation });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });
}
