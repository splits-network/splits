/**
 * Company Reputation Routes
 */

import { FastifyInstance } from 'fastify';
import { CompanyReputationServiceV2 } from './service';
import { requireUserContext } from '../shared/helpers';
import { validatePaginationParams } from '../shared/pagination';

interface RegisterCompanyReputationRoutesConfig {
    companyReputationService: CompanyReputationServiceV2;
}

export function registerCompanyReputationRoutes(
    app: FastifyInstance,
    config: RegisterCompanyReputationRoutesConfig
) {
    app.get('/api/v2/company-reputation', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;

            const pagination = validatePaginationParams(query.page, query.limit);
            const filters = {
                ...pagination,
                company_id: query.company_id,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await config.companyReputationService.getReputations(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/api/v2/company-reputation/:companyId', async (request, reply) => {
        try {
            requireUserContext(request);
            const { companyId } = request.params as { companyId: string };
            const record = await config.companyReputationService.getReputation(companyId);
            return reply.send({ data: record });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });
}
