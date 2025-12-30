import { FastifyInstance } from 'fastify';
import { RecruiterCandidateServiceV2 } from './service';
import { requireUserContext } from '../shared/helpers';
import { validatePaginationParams } from '../shared/pagination';

interface RegisterRecruiterCandidateRoutesConfig {
    recruiterCandidateService: RecruiterCandidateServiceV2;
}

export function registerRecruiterCandidateRoutes(
    app: FastifyInstance,
    config: RegisterRecruiterCandidateRoutesConfig
) {
    app.get('/v2/recruiter-candidates', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;

            const pagination = validatePaginationParams(query.page, query.limit);
            const filters = {
                ...pagination,
                recruiter_id: query.recruiter_id,
                candidate_id: query.candidate_id,
                status: query.status,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await config.recruiterCandidateService.getRecruiterCandidates(
                clerkUserId,
                filters
            );
            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/v2/recruiter-candidates/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const record = await config.recruiterCandidateService.getRecruiterCandidate(id);
            return reply.send({ data: record });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/v2/recruiter-candidates', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const record = await config.recruiterCandidateService.createRecruiterCandidate(
                body,
                clerkUserId
            );
            return reply.code(201).send({ data: record });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.patch('/v2/recruiter-candidates/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const record = await config.recruiterCandidateService.updateRecruiterCandidate(
                id,
                updates,
                clerkUserId
            );
            return reply.send({ data: record });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.delete('/v2/recruiter-candidates/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await config.recruiterCandidateService.deleteRecruiterCandidate(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });
}
