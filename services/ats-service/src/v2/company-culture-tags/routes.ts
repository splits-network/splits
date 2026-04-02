import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CompanyCultureTagService } from './service.js';
import { requireUserContext } from '../shared/helpers.js';

interface RegisterCompanyCultureTagRoutesConfig {
    service: CompanyCultureTagService;
}

export function registerCompanyCultureTagRoutes(
    app: FastifyInstance,
    config: RegisterCompanyCultureTagRoutesConfig
) {
    app.get('/api/v2/company-culture-tags', async (request: FastifyRequest, reply: FastifyReply) => {
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
                .send({ error: { message: error.message || 'Failed to load company culture tags' } });
        }
    });

    app.put('/api/v2/companies/:companyId/culture-tags', async (request: FastifyRequest<{
        Params: { companyId: string };
        Body: { culture_tags: Array<{ culture_tag_id: string }> };
    }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { companyId } = request.params;
            const { culture_tags } = request.body;

            if (!culture_tags) {
                return reply.code(400).send({ error: { message: 'culture_tags array is required' } });
            }

            const data = await config.service.bulkReplace(companyId, culture_tags);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to bulk replace company culture tags' } });
        }
    });
}
