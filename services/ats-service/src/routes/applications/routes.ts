import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AtsService } from '../../service';
import { BadRequestError } from '@splits-network/shared-fastify';
import { SubmitCandidateDTO, UpdateApplicationStageDTO } from '@splits-network/shared-types';

export function registerApplicationRoutes(app: FastifyInstance, service: AtsService) {
    // Get all applications with optional filters
    app.get(
        '/applications',
        async (request: FastifyRequest<{ Querystring: { recruiter_id?: string; job_id?: string; stage?: string; candidate_id?: string } }>, reply: FastifyReply) => {
            const { recruiter_id, job_id, stage, candidate_id } = request.query;
            
            // If candidate_id is provided, use specific method for better performance
            if (candidate_id) {
                const applications = await service.getApplicationsByCandidateId(candidate_id);
                return reply.send({ data: applications });
            }
            
            const applications = await service.getApplications({ recruiter_id, job_id, stage });
            return reply.send({ data: applications });
        }
    );

    // Get application by ID
    app.get(
        '/applications/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const application = await service.getApplicationById(request.params.id);
            return reply.send({ data: application });
        }
    );

    // Create new application (submit candidate)
    app.post(
        '/applications',
        async (request: FastifyRequest<{ Body: SubmitCandidateDTO }>, reply: FastifyReply) => {
            const { job_id, full_name, email, linkedin_url, notes } = request.body;

            if (!job_id || !full_name || !email) {
                throw new BadRequestError('Missing required fields');
            }

            // TODO: Extract recruiter_id from authenticated user context
            const recruiterId = (request.body as any).recruiter_id;

            const application = await service.submitCandidate(
                job_id,
                email,
                full_name,
                recruiterId,
                { linkedin_url, notes }
            );

            return reply.status(201).send({ data: application });
        }
    );

    // Update application stage
    app.patch(
        '/applications/:id/stage',
        async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateApplicationStageDTO }>, reply: FastifyReply) => {
            const { stage, notes } = request.body;

            if (!stage) {
                throw new BadRequestError('Stage is required');
            }

            // Extract audit context
            const auditContext = {
                userId: (request as any).auth?.userId,
                userRole: (request as any).auth?.memberships?.[0]?.role,
                companyId: (request as any).auth?.memberships?.[0]?.organization_id,
            };

            const application = await service.updateApplicationStage(
                request.params.id,
                stage as any,
                notes,
                auditContext
            );

            request.log.info({
                applicationId: request.params.id,
                newStage: stage,
                userId: auditContext.userId,
                userRole: auditContext.userRole,
            }, 'Application stage updated');

            return reply.send({ data: application });
        }
    );

    // Accept application
    app.post(
        '/applications/:id/accept',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            // Extract audit context from request
            const auditContext = {
                userId: (request as any).auth?.userId,
                userRole: (request as any).auth?.memberships?.[0]?.role,
                companyId: (request as any).auth?.memberships?.[0]?.organization_id,
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'],
            };

            const application = await service.acceptApplication(
                request.params.id,
                auditContext
            );
            
            request.log.info({
                applicationId: request.params.id,
                userId: auditContext.userId,
                userRole: auditContext.userRole,
                companyId: auditContext.companyId,
            }, 'Application accepted by company');

            return reply.send({ data: application });
        }
    );

    // Get audit log for an application
    app.get(
        '/applications/:id/audit-log',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const auditLog = await service.getApplicationAuditLog(request.params.id);
            return reply.send({ data: auditLog });
        }
    );
}
