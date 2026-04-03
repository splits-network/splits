import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CompanyPerkService } from './service.js';
import { requireUserContext } from '../shared/helpers.js';

interface RegisterCompanyPerkRoutesConfig {
    service: CompanyPerkService;
}

export function registerCompanyPerkRoutes(
    app: FastifyInstance,
    config: RegisterCompanyPerkRoutesConfig
) {
    app.get('/api/v2/company-perks', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { company_id } = request.query as { company_id?: string };
            if (!company_id) {
                return reply.code(400).send({ error: { message: 'company_id query parameter is required' } });
            }
            const data = await config.service.listByCompanyId(company_id);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to load company perks' } });
        }
    });

    app.put('/api/v2/companies/:companyId/perks', async (request: FastifyRequest<{
        Params: { companyId: string };
        Body: { perks: Array<{ perk_id: string }> };
    }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { companyId } = request.params;
            const { perks } = request.body;

            if (!perks) {
                return reply.code(400).send({ error: { message: 'perks array is required' } });
            }

            const data = await config.service.bulkReplace(companyId, perks);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to bulk replace company perks' } });
        }
    });
}
