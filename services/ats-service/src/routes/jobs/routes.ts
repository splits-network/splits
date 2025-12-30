import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AtsService } from '../../service';
import { BadRequestError } from '@splits-network/shared-fastify';
import { CreateJobDTO } from '@splits-network/shared-types';

/**
 * Extract user context from gateway-provided headers
 * 
 * CRITICAL: We do NOT use x-user-role anymore. Role is resolved from database.
 * Only clerk_user_id and optional organization_id are needed.
 */
function requireUserContext(request: FastifyRequest): { clerkUserId: string; organizationId: string | null } {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    const organizationId = (request.headers['x-organization-id'] as string) || null;
    
    if (!clerkUserId) {
        throw new Error('Missing x-clerk-user-id header');
    }
    
    return { clerkUserId, organizationId };
}

export function registerJobRoutes(app: FastifyInstance, service: AtsService) {
    /**
     * NEW: Get jobs for current user (role-filtered by backend via database JOINs)
     * 
     * Backend determines data scope via database JOINs to:
     *   - network.recruiters (recruiter role - marketplace jobs)
     *   - identity.memberships (company_admin, hiring_manager - org jobs only)
     *   - ats.candidates (candidate role - all active jobs)
     */
    app.get(
        '/jobs',
        async (request: FastifyRequest<{ 
            Querystring: { 
                page?: string;
                limit?: string;
                search?: string;
                status?: string;
                location?: string;
                employment_type?: string;
                sort_by?: string;
                sort_order?: 'asc' | 'desc';
            } 
        }>, reply: FastifyReply) => {
            const { clerkUserId, organizationId } = requireUserContext(request);
            
            const page = request.query.page ? parseInt(request.query.page, 10) : 1;
            const limit = request.query.limit ? parseInt(request.query.limit, 10) : 25;
            
            const result = await service.getJobsForUser(clerkUserId, organizationId, {
                search: request.query.search,
                status: request.query.status,
                location: request.query.location,
                employment_type: request.query.employment_type,
                sort_by: request.query.sort_by,
                sort_order: request.query.sort_order,
                page,
                limit,
            });
            
            return reply.send({ 
                data: result.data,
                pagination: result.pagination,
            });
        }
    );

    // LEGACY: Get all jobs with optional filters (OLD PATTERN)
    app.get(
        '/jobs/legacy',
        async (request: FastifyRequest<{ 
            Querystring: { 
                status?: string; 
                search?: string; 
                location?: string;
                employment_type?: string;
                limit?: string; 
                offset?: string;
            } 
        }>, reply: FastifyReply) => {
            const { status, search, location, employment_type, limit, offset } = request.query;
            const result = await service.getJobs({
                status,
                search,
                location,
                employment_type,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
            });
            return reply.send({ 
                data: result.jobs,
                total: result.total,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : 0,
            });
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
                recruiter_description,
                candidate_description,
                employment_type,
                open_to_relocation,
                show_salary_range,
                splits_fee_percentage,
                job_owner_id,
                status,
                requirements,
                pre_screen_questions,
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
                recruiter_description,
                candidate_description,
                employment_type,
                open_to_relocation: open_to_relocation ?? false,
                show_salary_range: show_salary_range ?? true,
                splits_fee_percentage: splits_fee_percentage ?? 50,
                job_owner_id,
                status,
                requirements,
                pre_screen_questions,
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
