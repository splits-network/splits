/**
 * Public Firm Routes (unauthenticated)
 * Marketplace-visible firm profiles accessible without login.
 */

import { FastifyInstance } from 'fastify';
import { FirmServiceV2 } from './service.js';
import { validatePaginationParams } from '../shared/pagination.js';

interface RegisterPublicFirmRoutesConfig {
    firmService: FirmServiceV2;
}

export function registerPublicFirmRoutes(
    app: FastifyInstance,
    config: RegisterPublicFirmRoutesConfig
) {
    // LIST marketplace-visible firms
    app.get('/api/v2/public/firms', async (request, reply) => {
        try {
            const query = request.query as any;
            const pagination = validatePaginationParams(
                query.page ? Number(query.page) : undefined,
                query.limit ? Number(query.limit) : undefined
            );

            const filters = {
                ...pagination,
                search: query.search,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
                industries: query.industries ? [].concat(query.industries) : undefined,
                specialties: query.specialties ? [].concat(query.specialties) : undefined,
                placement_types: query.placement_types ? [].concat(query.placement_types) : undefined,
                geo_focus: query.geo_focus ? [].concat(query.geo_focus) : undefined,
                candidate_firm: query.candidate_firm === 'true' ? true : undefined,
            };

            const result = await config.firmService.getPublicFirms(filters);
            return reply.send(result);
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // GET firm by slug
    app.get('/api/v2/public/firms/:slug', async (request, reply) => {
        try {
            const { slug } = request.params as { slug: string };
            const firm = await config.firmService.getPublicFirmBySlug(slug);
            return reply.send({ data: firm });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // GET enriched firm profile (firm + placement stats + recent placements)
    app.get('/api/v2/public/firms/:slug/profile', async (request, reply) => {
        try {
            const { slug } = request.params as { slug: string };
            const result = await config.firmService.getPublicFirmProfile(slug);
            if (!result) {
                return reply.code(404).send({ error: 'Firm not found' });
            }
            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    // GET firm public members
    app.get('/api/v2/public/firms/:slug/members', async (request, reply) => {
        try {
            const { slug } = request.params as { slug: string };
            const members = await config.firmService.getPublicFirmMembers(slug);
            return reply.send({ data: members });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });
}
