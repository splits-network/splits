import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles, AuthenticatedRequest } from '../../rbac';

/**
 * Unified Proposals Routes (Phase 1A)
 * - Single interface for all proposal workflows
 * - Replaces legacy /proposed-jobs and old Phase 2 /proposals
 * 
 * @see docs/guidance/unified-proposals-system.md
 */

/**
 * Determine user role based on memberships
 */
function determineUserRole(auth: any): string {
    const memberships = auth.memberships || [];
    
    // Priority order: platform_admin > company_admin/hiring_manager > recruiter
    if (memberships.some((m: any) => m.role === 'platform_admin')) {
        return 'admin';
    }
    if (memberships.some((m: any) => ['company_admin', 'hiring_manager'].includes(m.role))) {
        return 'company';
    }
    if (memberships.some((m: any) => m.role === 'recruiter')) {
        return 'recruiter';
    }
    
    return 'candidate'; // Default to candidate if no other role
}

export function registerProposalsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');
    const networkService = () => services.get('network');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    /**
     * Resolve entity ID for user context
     * - For recruiters: userId (Clerk) → recruiter_id (network.recruiters)
     * - For other roles: use userId directly
     */
    async function resolveEntityId(userId: string, userRole: string, correlationId: string): Promise<{ entityId: string; isInactive?: boolean }> {
        if (userRole === 'recruiter') {
            try {
                const recruiterResponse: any = await networkService().get(
                    `/recruiters/by-user/${userId}`,
                    undefined,
                    correlationId
                );

                if (recruiterResponse.data && recruiterResponse.data.status === 'active') {
                    return { entityId: recruiterResponse.data.id }; // Use recruiter_id
                } else {
                    return { entityId: userId, isInactive: true }; // Inactive recruiter
                }
            } catch (error) {
                throw new Error('Failed to verify recruiter status');
            }
        }
        return { entityId: userId }; // Use userId directly for non-recruiters
    }

    /**
     * GET /api/proposals
     * Get all proposals for current user (role-filtered)
     */
    app.get('/api/proposals', {
        schema: {
            description: 'Get all proposals for current user',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);

        // Determine user role
        const userRole = determineUserRole(req.auth);

        // Resolve entity ID (userId → recruiter_id for recruiters)
        const { entityId, isInactive } = await resolveEntityId(req.auth.userId, userRole, correlationId);
        if (isInactive) {
            return reply.send({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 }, summary: { actionable_count: 0, waiting_count: 0, urgent_count: 0, overdue_count: 0 } });
        }

        // Forward query params directly to ATS service
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = `/api/proposals?${queryString}`;

        // Add user context headers for ATS service
        const headers = {
            'x-user-id': entityId,
            'x-user-role': userRole,
        };

        const data = await atsService().get(path, undefined, correlationId, headers);
        return reply.send(data);
    });

    /**
     * GET /api/proposals/actionable
     * Get proposals requiring user's action
     */
    app.get('/api/proposals/actionable', {
        schema: {
            description: 'Get proposals requiring your action',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);

        const userRole = determineUserRole(req.auth);
        const { entityId, isInactive } = await resolveEntityId(req.auth.userId, userRole, correlationId);
        if (isInactive) {
            return reply.send({ data: [] });
        }
        
        const headers = {
            'x-user-id': entityId,
            'x-user-role': userRole,
        };
        
        const data = await atsService().get('/api/proposals/actionable', undefined, correlationId, headers);
        return reply.send(data);
    });

    /**
     * GET /api/proposals/pending
     * Get proposals awaiting response from others
     */
    app.get('/api/proposals/pending', {
        schema: {
            description: 'Get proposals awaiting response from others',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);

        const userRole = determineUserRole(req.auth);
        const { entityId, isInactive } = await resolveEntityId(req.auth.userId, userRole, correlationId);
        if (isInactive) {
            return reply.send({ data: [] });
        }
        
        const headers = {
            'x-user-id': entityId,
            'x-user-role': userRole,
        };
        
        const data = await atsService().get('/api/proposals/pending', undefined, correlationId, headers);
        return reply.send(data);
    });

    /**
     * GET /api/proposals/summary
     * Get summary statistics
     */
    app.get('/api/proposals/summary', {
        schema: {
            description: 'Get proposal summary statistics',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);

        const userRole = determineUserRole(req.auth);
        const { entityId, isInactive } = await resolveEntityId(req.auth.userId, userRole, correlationId);
        if (isInactive) {
            return reply.send({ actionable_count: 0, waiting_count: 0, urgent_count: 0, overdue_count: 0 });
        }
        
        const headers = {
            'x-user-id': entityId,
            'x-user-role': userRole,
        };
        
        const data = await atsService().get('/api/proposals/summary', undefined, correlationId, headers);
        return reply.send(data);
    });

    /**
     * GET /api/proposals/:id
     * Get single proposal details
     */
    app.get('/api/proposals/:id', {
        schema: {
            description: 'Get proposal by ID',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);

        const userRole = determineUserRole(req.auth);
        const { entityId } = await resolveEntityId(req.auth.userId, userRole, correlationId);
        
        const headers = {
            'x-user-id': entityId,
            'x-user-role': userRole,
        };
        
        const data = await atsService().get(`/api/proposals/${id}`, undefined, correlationId, headers);
        return reply.send(data);
    });

    /**
     * POST /api/proposals/:id/accept
     * Accept a proposal (candidate accepts job opportunity, company accepts application)
     */
    app.post('/api/proposals/:id/accept', {
        schema: {
            description: 'Accept a proposal',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);

        // Map to appropriate ATS endpoint based on stage
        // For recruiter_proposed → candidate accepting job opportunity
        // For submitted → company accepting application
        const data = await atsService().post(`/applications/${id}/accept`, request.body, correlationId);
        return reply.send(data);
    });

    /**
     * POST /api/proposals/:id/decline
     * Decline a proposal
     */
    app.post('/api/proposals/:id/decline', {
        schema: {
            description: 'Decline a proposal',
            tags: ['proposals'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);

        // Map to appropriate ATS endpoint
        const data = await atsService().post(`/applications/${id}/decline`, request.body, correlationId);
        return reply.send(data);
    });
}
