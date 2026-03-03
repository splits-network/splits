import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CompanySkillService } from './service';
import { requireUserContext } from '../shared/helpers';

interface RegisterCompanySkillRoutesConfig {
    service: CompanySkillService;
}

export function registerCompanySkillRoutes(
    app: FastifyInstance,
    config: RegisterCompanySkillRoutesConfig
) {
    app.get('/api/v2/company-skills', async (request: FastifyRequest, reply: FastifyReply) => {
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
                .send({ error: { message: error.message || 'Failed to load company skills' } });
        }
    });

    app.put('/api/v2/companies/:companyId/skills', async (request: FastifyRequest<{
        Params: { companyId: string };
        Body: { skills: Array<{ skill_id: string }> };
    }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { companyId } = request.params;
            const { skills } = request.body;

            if (!skills) {
                return reply.code(400).send({ error: { message: 'skills array is required' } });
            }

            const data = await config.service.bulkReplace(companyId, skills);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to bulk replace company skills' } });
        }
    });
}
