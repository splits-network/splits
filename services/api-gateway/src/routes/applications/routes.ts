import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles, AuthenticatedRequest, isRecruiter } from '../../rbac';
import { convertClerkIdsInBody } from '../../clerk-id-converter';
import { buildAuthHeaders } from '../../helpers/auth-headers';

/**
 * Applications Routes (API Gateway)
 * Part of API Role-Based Scoping Migration (Phase 2 - Applications)
 * 
 * Uses buildAuthHeaders() helper for consistent auth context.
 * NO x-user-role header - backend resolves role from database JOINs.
 * 
 * @see docs/migration/MIGRATION-PROGRESS.md
 * @see docs/migration/DATABASE-JOIN-PATTERN.md
 */
export function registerApplicationsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    /**
     * Proxy helper that catches ServiceClient errors and passes through status codes
     */
    async function proxyToService<T>(
        serviceCall: Promise<T>,
        reply: FastifyReply
    ): Promise<T | void> {
        try {
            return await serviceCall;
        } catch (error: any) {
            // If error has statusCode (from ServiceClient), pass it through
            if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
                // Try to parse the error body as JSON
                const errorResponse = error.jsonBody || { 
                    error: { 
                        code: 'SERVICE_ERROR', 
                        message: error.message 
                    } 
                };
                return reply.status(error.statusCode).send(errorResponse);
            }
            // For other errors, re-throw to let Fastify's error handler deal with it
            throw error;
        }
    }

    /**
     * LEGACY: Determine user's primary role from Clerk memberships
     * Used by old endpoints that still need x-user-role header.
     * NEW endpoints should use buildAuthHeaders() instead.
     */
    function determineUserRole(auth: any): 'candidate' | 'recruiter' | 'company' | 'admin' {
        const memberships = auth.memberships || [];
        
        if (memberships.some((m: any) => m.role === 'platform_admin')) {
            return 'admin';
        }
        if (memberships.some((m: any) => m.role === 'company_admin' || m.role === 'hiring_manager')) {
            return 'company';
        }
        if (memberships.some((m: any) => m.role === 'recruiter')) {
            return 'recruiter';
        }
        return 'candidate';
    }

    /**
     * NEW: List applications with server-side pagination, search, and filters
     * Backend determines data scope via database JOINs (no x-user-role header)
     */
    app.get('/api/applications', {
        schema: {
            description: 'List applications with pagination, search, and filters',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const authHeaders = buildAuthHeaders(request);
        
        // Build query params - pass query filters as-is
        const queryParams = new URLSearchParams(request.query as any);
        const queryString = queryParams.toString();
        const path = queryString ? `/applications?${queryString}` : '/applications';
        
        const data = await atsService().get(path, undefined, correlationId, authHeaders);
        return reply.send(data);
    });

    // LEGACY: List applications with server-side pagination and filtering (OLD PATTERN with x-user-role)
    app.get('/api/applications/paginated', {
        schema: {
            description: 'List applications with pagination, search, and filters',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);
        
        // Determine user role
        const userRole = determineUserRole(req.auth);
        
        // Build query params - pass query filters as-is
        const queryParams = new URLSearchParams(request.query as any);
        const queryString = queryParams.toString();
        const path = `/applications/paginated?${queryString}`;
        
        // Pass raw Clerk user ID and role to ATS service for internal resolution
        const headers = {
            'x-clerk-user-id': req.auth.clerkUserId,
            'x-user-role': userRole,
        };
        
        const data = await atsService().get(path, undefined, correlationId, headers);
        return reply.send(data);
    });

    // Get application by ID
    app.get('/api/applications/:id', {
        schema: {
            description: 'Get application by ID',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await proxyToService(
            atsService().get(`/applications/${id}`),
            reply
        );
        if (data !== undefined) {
            return reply.send(data);
        }
    });

    // Submit application (recruiters only)
    app.post('/api/applications', {
        preHandler: requireRoles(['recruiter']),
        schema: {
            description: 'Submit new application',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);
        const identityService = services.get('identity');

        // Convert Clerk IDs to UUIDs
        const body = await convertClerkIdsInBody(
            request.body,
            ['recruiter_id'],
            identityService,
            correlationId
        );

        // Simple proxy - pass user context to backend
        const userRole = determineUserRole(req.auth);
        const data = await atsService().post('/applications', body, correlationId, {
            'x-clerk-user-id': req.auth.clerkUserId,
            'x-user-role': userRole,
        });
        return reply.send(data);
    });

    // Accept application (company users only)
    app.post('/api/applications/:id/accept', {
        preHandler: requireRoles(['company_admin', 'hiring_manager']),
        schema: {
            description: 'Accept application',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().post(`/applications/${id}/accept`, request.body, correlationId);
        return reply.send(data);
    });

    // Change application stage (recruiters, company users and admins)
    app.patch('/api/applications/:id/stage', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'platform_admin']),
        schema: {
            description: 'Change application stage',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await atsService().patch(`/applications/${id}/stage`, request.body);
        return reply.send(data);
    });

    // Add note to application (recruiters only)
    app.patch('/api/applications/:id/notes', {
        preHandler: requireRoles(['recruiter', 'platform_admin']),
        schema: {
            description: 'Add note to application',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await atsService().patch(`/applications/${id}/notes`, request.body);
        return reply.send(data);
    });

    // Submit candidate application (candidate self-service)
    app.post('/api/applications/submit', {
        preHandler: requireRoles(['candidate'], services),
        schema: {
            description: 'Submit candidate application',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);
        
        request.log.info({ 
            userId: req.auth.userId,
            body: request.body 
        }, 'Candidate submitting application');

        // Pass user ID to backend for candidate lookup
        const data = await atsService().post('/applications/submit', request.body, correlationId, {
            'x-clerk-user-id': req.auth.clerkUserId,
        });
        return reply.status(201).send(data);
    });

    // Withdraw application (candidates only)
    app.post('/api/applications/:id/withdraw', {
        preHandler: requireRoles(['candidate'], services),
        schema: {
            description: 'Withdraw application',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);

        // Pass user ID to backend for candidate lookup and permission checking
        const data = await atsService().post(`/applications/${id}/withdraw`, request.body, correlationId, {
            'x-clerk-user-id': req.auth.clerkUserId,
        });
        return reply.send(data);
    });

    // Get full application details with documents and pre-screen answers
    app.get('/api/applications/:id/full', {
        schema: {
            description: 'Get full application details',
            tags: ['applications'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await atsService().get(`/applications/${id}/full`);
        return reply.send(data);
    });

    // Get pending applications for recruiter
    app.get('/api/recruiters/:recruiterId/pending-applications', {
        preHandler: requireRoles(['recruiter']),
        schema: {
            description: 'Get pending applications for recruiter',
            tags: ['applications', 'recruiters'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { recruiterId } = request.params as { recruiterId: string };
        const data = await atsService().get(`/recruiters/${recruiterId}/pending-applications`);
        return reply.send(data);
    });

    // Recruiter proposes job to candidate (creates application in recruiter_proposed stage)
    app.post('/api/applications/propose-to-candidate', {
        preHandler: requireRoles(['recruiter'], services),
        schema: {
            description: 'Recruiter proposes job opportunity to candidate (requires candidate approval)',
            tags: ['applications', 'recruiters'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);
        const userRole = determineUserRole(req.auth);
        
        // Pass Clerk user ID and role to backend for resolution
        const headers = {
            'x-clerk-user-id': req.auth.clerkUserId,
            'x-user-role': userRole,
        };
        
        try {
            const data = await atsService().post('/applications/propose-to-candidate', request.body, correlationId, headers);
            return reply.send(data);
        } catch (error: any) {
            // If backend returned client error (4xx), pass it through with proper status
            if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
                try {
                    const errorData = JSON.parse(error.body);
                    return reply.code(error.statusCode).send(errorData);
                } catch {
                    return reply.code(error.statusCode).send({ 
                        error: { 
                            message: error.message 
                        } 
                    });
                }
            }
            // For other errors, let default error handler deal with it
            throw error;
        }
    });

    // Recruiter submits application to company
    app.post('/api/applications/:id/recruiter-submit', {
        preHandler: requireRoles(['recruiter']),
        schema: {
            description: 'Recruiter submits application to company',
            tags: ['applications', 'recruiters'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().post(`/applications/${id}/recruiter-submit`, request.body, correlationId);
        return reply.send(data);
    });

    // Company requests pre-screen for direct application
    app.post('/api/applications/:id/request-prescreen', {
        preHandler: requireRoles(['company_admin', 'hiring_manager']),
        schema: {
            description: 'Request recruiter pre-screen for direct application',
            tags: ['applications', 'company'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        
        // Add user context to request body
        const requestBody = {
            ...(request.body as any),
            requested_by_user_id: req.auth.userId,
        };

        const data = await atsService().post(`/applications/${id}/request-prescreen`, requestBody, correlationId);
        return reply.send(data);
    });

    // Get AI review for application
    app.get('/api/applications/:id/ai-review', {
        schema: {
            description: 'Get AI review for application',
            tags: ['applications', 'ai-review'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await proxyToService(
            atsService().get(`/applications/${id}/ai-review`, undefined, correlationId),
            reply
        );
        if (data !== undefined) {
            return reply.send(data);
        }
    });

    // Trigger AI review for application (POST)
    app.post('/api/applications/:id/ai-review', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager']),
        schema: {
            description: 'Trigger AI review for application',
            tags: ['applications', 'ai-review'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().post(`/applications/${id}/ai-review`, request.body, correlationId);
        return reply.send(data);
    });

    // Candidate approves recruiter-proposed opportunity
    app.post('/api/applications/:id/candidate-approve', {
        preHandler: requireRoles(['candidate'], services),
        schema: {
            description: 'Candidate approves recruiter-proposed job opportunity',
            tags: ['applications', 'candidate'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        
        // Pass Clerk user ID to backend for candidate lookup
        const headers = {
            'x-clerk-user-id': req.auth.clerkUserId,
            'x-user-role': 'candidate',
        };

        const data = await atsService().post(`/applications/${id}/candidate-approve`, request.body, correlationId, headers);
        return reply.send(data);
    });

    // Candidate declines recruiter-proposed opportunity
    app.post('/api/applications/:id/candidate-decline', {
        preHandler: requireRoles(['candidate'], services),
        schema: {
            description: 'Candidate declines recruiter-proposed job opportunity',
            tags: ['applications', 'candidate'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        
        // Pass Clerk user ID to backend for candidate lookup
        const headers = {
            'x-clerk-user-id': req.auth.clerkUserId,
            'x-user-role': 'candidate',
        };

        const data = await atsService().post(`/applications/${id}/candidate-decline`, request.body, correlationId, headers);
        return reply.send(data);
    });

    // Accept proposal (alias endpoint matching spec)
    app.post('/api/applications/:id/accept-proposal', {
        preHandler: requireRoles(['candidate'], services),
        schema: {
            description: 'Candidate accepts recruiter-proposed job opportunity',
            tags: ['applications', 'candidate'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        
        const headers = {
            'x-clerk-user-id': req.auth.clerkUserId,
            'x-user-role': 'candidate',
        };

        const data = await atsService().post(`/applications/${id}/accept-proposal`, request.body, correlationId, headers);
        return reply.send(data);
    });

    // Decline proposal (alias endpoint matching spec)
    app.post('/api/applications/:id/decline-proposal', {
        preHandler: requireRoles(['candidate'], services),
        schema: {
            description: 'Candidate declines recruiter-proposed job opportunity',
            tags: ['applications', 'candidate'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        
        const headers = {
            'x-clerk-user-id': req.auth.clerkUserId,
            'x-user-role': 'candidate',
        };

        const data = await atsService().post(`/applications/${id}/decline-proposal`, request.body, correlationId, headers);
        return reply.send(data);
    });

    // Complete application
    app.patch('/api/applications/:id/complete', {
        preHandler: requireRoles(['candidate'], services),
        schema: {
            description: 'Complete candidate application with documents and answers',
            tags: ['applications', 'candidate'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        
        const headers = {
            'x-clerk-user-id': req.auth.clerkUserId,
            'x-user-role': 'candidate',
        };

        const data = await atsService().patch(`/applications/${id}/complete`, request.body, correlationId, headers);
        return reply.send(data);
    });
}

