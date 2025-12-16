import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AtsService } from '../../service';
import { BadRequestError } from '@splits-network/shared-fastify';
import { CreateJobDTO } from '@splits-network/shared-types';

export function registerJobRoutes(app: FastifyInstance, service: AtsService) {
    // Get all jobs with optional filters
    app.get(
        '/jobs',
        async (request: FastifyRequest<{ Querystring: { status?: string; search?: string; limit?: string; offset?: string } }>, reply: FastifyReply) => {
            const { status, search, limit, offset } = request.query;
            const jobs = await service.getJobs({
                status,
                search,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
            });
            return reply.send({ data: jobs });
        }
    );

    // Get job by ID
    app.get(
        '/jobs/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const job = await service.getJobById(request.params.id);
            return reply.send({ data: job });
        }
    );

    // Create new job
    app.post(
        '/jobs',
        async (request: FastifyRequest<{ Body: CreateJobDTO }>, reply: FastifyReply) => {
            const {
                title,
                company_id,
                fee_percentage,
                department,
                location,
                salary_min,
                salary_max,
                description,
                status,
            } = request.body as any;

            if (!title || !company_id || fee_percentage === undefined) {
                throw new BadRequestError('Missing required fields');
            }

            const job = await service.createJob(company_id, title, fee_percentage, {
                department,
                location,
                salary_min,
                salary_max,
                description,
                status,
            });

            return reply.status(201).send({ data: job });
        }
    );

    // Update job
    app.patch(
        '/jobs/:id',
        async (request: FastifyRequest<{ Params: { id: string }; Body: Partial<CreateJobDTO> }>, reply: FastifyReply) => {
            const job = await service.updateJob(request.params.id, request.body as any);
            return reply.send({ data: job });
        }
    );

    // Get applications for a job
    app.get(
        '/jobs/:jobId/applications',
        async (request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
            const applications = await service.getApplicationsByJobId(request.params.jobId);
            return reply.send({ data: applications });
        }
    );
}
