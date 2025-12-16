import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NetworkService } from '../../service';
import { BadRequestError } from '@splits-network/shared-fastify';

interface AssignRecruiterBody {
    job_id: string;
    recruiter_id: string;
    assigned_by?: string;
}

/**
 * Role Assignment Routes
 * - Recruiter-to-job assignments
 * - Access control queries
 */
export function registerAssignmentRoutes(app: FastifyInstance, service: NetworkService) {
    // Get jobs assigned to a recruiter
    app.get(
        '/recruiters/:recruiterId/jobs',
        async (request: FastifyRequest<{ Params: { recruiterId: string } }>, reply: FastifyReply) => {
            const jobIds = await service.getAssignedJobsForRecruiter(request.params.recruiterId);
            return reply.send({ data: jobIds });
        }
    );

    // Get recruiters assigned to a job
    app.get(
        '/jobs/:jobId/recruiters',
        async (request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) => {
            const recruiterIds = await service.getAssignedRecruitersForJob(request.params.jobId);
            return reply.send({ data: recruiterIds });
        }
    );

    // Create assignment
    app.post('/assignments', async (request: FastifyRequest<{ Body: AssignRecruiterBody }>, reply: FastifyReply) => {
        const { job_id, recruiter_id, assigned_by } = request.body;

        if (!job_id || !recruiter_id) {
            throw new BadRequestError('job_id and recruiter_id are required');
        }

        try {
            const assignment = await service.assignRecruiterToJob(job_id, recruiter_id, assigned_by);
            return reply.status(201).send({ data: assignment });
        } catch (error: any) {
            if (error.message.includes('not active')) {
                throw new BadRequestError(error.message);
            }
            throw error;
        }
    });

    // Delete assignment
    app.delete(
        '/assignments',
        async (
            request: FastifyRequest<{ Querystring: { job_id: string; recruiter_id: string } }>,
            reply: FastifyReply
        ) => {
            const { job_id, recruiter_id } = request.query;

            if (!job_id || !recruiter_id) {
                throw new BadRequestError('job_id and recruiter_id are required');
            }

            await service.unassignRecruiterFromJob(job_id, recruiter_id);
            return reply.status(204).send();
        }
    );

    // Access check route
    app.get(
        '/access-check',
        async (
            request: FastifyRequest<{ Querystring: { user_id: string; job_id: string } }>,
            reply: FastifyReply
        ) => {
            const { user_id, job_id } = request.query;

            if (!user_id || !job_id) {
                throw new BadRequestError('user_id and job_id are required');
            }

            const hasAccess = await service.canUserAccessJob(user_id, job_id);
            return reply.send({ data: { has_access: hasAccess } });
        }
    );
}
