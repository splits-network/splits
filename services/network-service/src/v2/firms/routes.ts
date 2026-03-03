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
                marketplace_visible: query.marketplace_visible !== undefined
                    ? query.marketplace_visible === 'true'
                    : undefined,
                candidate_firm: query.candidate_firm !== undefined
                    ? query.candidate_firm === 'true'
                    : undefined,
                industries: query.industries
                    ? (Array.isArray(query.industries) ? query.industries : [query.industries])
                    : undefined,
                specialties: query.specialties
                    ? (Array.isArray(query.specialties) ? query.specialties : [query.specialties])
                    : undefined,
                placement_types: query.placement_types
                    ? (Array.isArray(query.placement_types) ? query.placement_types : [query.placement_types])
                    : undefined,
                geo_focus: query.geo_focus
                    ? (Array.isArray(query.geo_focus) ? query.geo_focus : [query.geo_focus])
                    : undefined,
            };

            const result = await config.firmService.getFirms(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // GET current user's firm
    app.get('/api/v2/firms/my-firm', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const firm = await config.firmService.getMyFirm(clerkUserId);
            return reply.send({ data: firm });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // GET all firms for current user
    app.get('/api/v2/firms/my-firms', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const firms = await config.firmService.getMyFirms(clerkUserId);
            return reply.send({ data: firms });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // GET firm by slug
    app.get('/api/v2/firms/by-slug/:slug', async (request, reply) => {
        try {
            const { slug } = request.params as { slug: string };
            const firm = await config.firmService.getFirmBySlug(slug);
            return reply.send({ data: firm });
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

    // TRANSFER ownership
    app.post('/api/v2/firms/:firmId/transfer-ownership', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const body = request.body as any;

            if (!body.newOwnerRecruiterId) {
                return reply.code(400).send({ error: 'newOwnerRecruiterId is required' });
            }

            const firm = await config.firmService.transferOwnership(firmId, body, clerkUserId);
            return reply.send({ data: firm });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // ── Invitations ──

    // LIST invitations
    app.get('/api/v2/firms/:firmId/invitations', async (request, reply) => {
        try {
            const { firmId } = request.params as { firmId: string };
            const invitations = await config.firmService.listFirmInvitations(firmId);
            return reply.send({ data: invitations });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // CANCEL invitation
    app.delete('/api/v2/firms/:firmId/invitations/:invitationId', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId, invitationId } = request.params as { firmId: string; invitationId: string };
            await config.firmService.cancelFirmInvitation(firmId, invitationId, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // RESEND invitation
    app.post('/api/v2/firms/:firmId/invitations/:invitationId/resend', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId, invitationId } = request.params as { firmId: string; invitationId: string };
            const invitation = await config.firmService.resendFirmInvitation(firmId, invitationId, clerkUserId);
            return reply.send({ data: invitation });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

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
