import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CompanyServiceV2 } from './service';
import { CompanyUpdate } from './types';
import { requireUserContext } from '../shared/helpers';

interface RegisterCompanyRoutesConfig {
    companyService: CompanyServiceV2;
}

export function registerCompanyRoutes(
    app: FastifyInstance,
    config: RegisterCompanyRoutesConfig
) {
    app.get('/api/v2/companies', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const filters = request.query as any;
            const result = await config.companyService.getCompanies(clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/api/v2/companies/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const company = await config.companyService.getCompany(id);
            return reply.send({ data: company });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/api/v2/companies', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const company = await config.companyService.createCompany(request.body as any, clerkUserId);
            return reply.code(201).send({ data: company });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/api/v2/companies/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const company = await config.companyService.updateCompany(
                id,
                request.body as CompanyUpdate,
                clerkUserId
            );
            return reply.send({ data: company });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/api/v2/companies/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await config.companyService.deleteCompany(id, clerkUserId);
            return reply.send({ data: { message: 'Company deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
