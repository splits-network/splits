import { FastifyInstance } from 'fastify';
import { ProposalServiceV2 } from './service';
import { requireUserContext } from '../shared/helpers';
import { validatePaginationParams } from '../shared/pagination';

interface RegisterProposalRoutesConfig {
    proposalService: ProposalServiceV2;
}

export function registerProposalRoutes(
    app: FastifyInstance,
    config: RegisterProposalRoutesConfig
) {
    app.get('/api/v2/proposals', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;

            const pagination = validatePaginationParams(query.page, query.limit);
            const filters = {
                ...pagination,
                search: query.search,
                state: query.state,
                recruiter_id: query.recruiter_id,
                job_id: query.job_id,
                candidate_id: query.candidate_id,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await config.proposalService.getProposals(clerkUserId, filters);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/api/v2/proposals/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const proposal = await config.proposalService.getProposal(id);
            return reply.send({ data: proposal });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/api/v2/proposals', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const proposal = await config.proposalService.createProposal(body, clerkUserId);
            return reply.code(201).send({ data: proposal });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.patch('/api/v2/proposals/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const proposal = await config.proposalService.updateProposal(id, updates, clerkUserId);
            return reply.send({ data: proposal });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.delete('/api/v2/proposals/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await config.proposalService.deleteProposal(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });
}
