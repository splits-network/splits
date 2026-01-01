import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles, AuthenticatedRequest } from '../../rbac';
import { convertClerkIdsInBody } from '../../clerk-id-converter';
import { buildAuthHeaders } from '../../helpers/auth-headers';

/**
 * Jobs Routes (API Gateway)
 * Part of API Role-Based Scoping Migration (Phase 3 - Jobs)
 * 
 * Uses buildAuthHeaders() helper for consistent auth context.
 * NO x-user-role header - backend resolves role from database JOINs.
 * 
 * @see docs/migration/MIGRATION-PROGRESS.md
 * @see docs/migration/DATABASE-JOIN-PATTERN.md
 */
export function registerJobsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');
    const networkService = () => services.get('network');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    /**
     * NEW: List jobs (role-filtered by backend via database JOINs)
     * Backend determines data scope - no x-user-role header needed
     */
    app.get('/api/jobs', {
        schema: {
            description: 'List jobs with role-based filtering',
            tags: ['jobs'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        console.log('[Gateway V1] /api/jobs - Request received (OLD ENDPOINT)');
        console.log('[Gateway V1] Query:', request.query);
        console.log('[Gateway V1] Auth headers:', buildAuthHeaders(request));
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);
        
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/jobs?${queryString}` : '/jobs';
        console.log('[Gateway V1] Calling ATS service at:', path);
        const data = await atsService().get(path, undefined, correlationId, authHeaders);
        return reply.send(data);
    });

    // LEGACY: List jobs (unfiltered)
    app.get('/api/jobs/legacy', {
        schema: {
            description: 'List all jobs (unfiltered - legacy)',
            tags: ['jobs'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/jobs/legacy?${queryString}` : '/jobs/legacy';
        const data = await atsService().get(path, undefined, correlationId);
        return reply.send(data);
    });

    // Get job by ID
    app.get('/api/jobs/:id', {
        schema: {
            description: 'Get job by ID',
            tags: ['jobs'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().get(`/jobs/${id}`, undefined, correlationId);
        return reply.send(data);
    });

    // Create job (company admins and platform admins only)
    app.post('/api/jobs', {
        preHandler: requireRoles(['company_admin', 'platform_admin']),
        schema: {
            description: 'Create new job',
            tags: ['jobs'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const identityService = services.get('identity');
        
        // Convert Clerk IDs to UUIDs
        const body = await convertClerkIdsInBody(
            request.body,
            ['job_owner_id'],
            identityService,
            correlationId
        );
        
        const data = await atsService().post('/jobs', body, correlationId);
        return reply.send(data);
    });

    // Update job (company admins and platform admins only)
    app.patch('/api/jobs/:id', {
        preHandler: requireRoles(['company_admin', 'platform_admin']),
        schema: {
            description: 'Update job',
            tags: ['jobs'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const identityService = services.get('identity');
        
        // Convert Clerk IDs to UUIDs
        const body = await convertClerkIdsInBody(
            request.body,
            ['job_owner_id'],
            identityService,
            correlationId
        );
        
        const data = await atsService().patch(`/jobs/${id}`, body, correlationId);
        return reply.send(data);
    });

    // Get applications for a job
    // Filtering by user role is handled by the backend service
    app.get('/api/jobs/:jobId/applications', {
        schema: {
            description: 'Get applications for a job',
            tags: ['jobs'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { jobId } = request.params as { jobId: string };
        const correlationId = getCorrelationId(request);

        // Pass Clerk user ID to backend for filtering
        // Backend will handle role-based filtering (recruiters see their apps, companies see all)
        const data = await atsService().get(
            `/jobs/${jobId}/applications`, 
            undefined, 
            correlationId,
            {
                'x-clerk-user-id': req.auth.clerkUserId,
                'x-user-role': req.auth.memberships?.[0]?.role || 'candidate',
            }
        );
        return reply.send(data);
    });

    // Get recruiters assigned to a job
    app.get('/api/jobs/:jobId/recruiters', {
        schema: {
            description: 'Get recruiters assigned to a job',
            tags: ['jobs'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { jobId } = request.params as { jobId: string };
        const data = await networkService().get(`/jobs/${jobId}/recruiters`);
        return reply.send(data);
    });

    // Get proposals for a job
    app.get('/api/jobs/:id/proposals', {
        schema: {
            description: 'Get proposals for a job',
            tags: ['jobs'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/jobs/${id}/proposals?${queryString}` : `/jobs/${id}/proposals`;
        const data = await networkService().get(path, undefined, correlationId);
        return reply.send(data);
    });

    // Get pre-screen questions for a job
    app.get('/api/jobs/:jobId/pre-screen-questions', {
        schema: {
            description: 'Get pre-screen questions for a job',
            tags: ['jobs'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { jobId } = request.params as { jobId: string };
        const data = await atsService().get(`/jobs/${jobId}/pre-screen-questions`);
        return reply.send(data);
    });
}
