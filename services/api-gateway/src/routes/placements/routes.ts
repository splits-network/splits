import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles } from '../../rbac';
import { convertClerkIdsInBody } from '../../clerk-id-converter';

/**
 * Placements Routes
 * - Placement CRUD operations
 * - Placement lifecycle (Phase 2)
 * - Placement collaboration (Phase 2)
 */
export function registerPlacementsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    // List placements
    app.get('/api/placements', {
        schema: {
            description: 'List all placements',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const queryString = new URLSearchParams(request.query as any).toString();
        const path = queryString ? `/placements?${queryString}` : '/placements';
        const data = await atsService().get(path);
        return reply.send(data);
    });

    // Get placement by ID
    app.get('/api/placements/:id', {
        schema: {
            description: 'Get placement by ID',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await atsService().get(`/placements/${id}`);
        return reply.send(data);
    });

    // Create placement (company admins and platform admins only)
    app.post('/api/placements', {
        preHandler: requireRoles(['company_admin', 'platform_admin']),
        schema: {
            description: 'Create new placement',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const identityService = services.get('identity');
        
        // Convert Clerk IDs to UUIDs
        const body = await convertClerkIdsInBody(
            request.body,
            ['recruiter_id'],
            identityService,
            correlationId
        );
        
        const data = await atsService().post('/placements', body, correlationId);
        return reply.send(data);
    });

    // ==========================================
    // Phase 2 Routes - Placement Lifecycle
    // ==========================================

    // Activate placement
    app.post('/api/placements/:id/activate', {
        preHandler: requireRoles(['company_admin', 'platform_admin']),
        schema: {
            description: 'Activate placement',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().post(`/placements/${id}/activate`, request.body, correlationId);
        return reply.send(data);
    });

    // Complete placement
    app.post('/api/placements/:id/complete', {
        preHandler: requireRoles(['company_admin', 'platform_admin']),
        schema: {
            description: 'Complete placement',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().post(`/placements/${id}/complete`, request.body, correlationId);
        return reply.send(data);
    });

    // Mark placement as failed
    app.post('/api/placements/:id/fail', {
        preHandler: requireRoles(['company_admin', 'platform_admin']),
        schema: {
            description: 'Mark placement as failed',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().post(`/placements/${id}/fail`, request.body, correlationId);
        return reply.send(data);
    });

    // Request replacement
    app.post('/api/placements/:id/request-replacement', {
        preHandler: requireRoles(['company_admin', 'platform_admin']),
        schema: {
            description: 'Request replacement for placement',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().post(`/placements/${id}/request-replacement`, request.body, correlationId);
        return reply.send(data);
    });

    // Link replacement placement
    app.post('/api/placements/:id/link-replacement', {
        preHandler: requireRoles(['company_admin', 'platform_admin']),
        schema: {
            description: 'Link replacement placement',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().post(`/placements/${id}/link-replacement`, request.body, correlationId);
        return reply.send(data);
    });

    // View placement state history
    app.get('/api/placements/:id/state-history', {
        schema: {
            description: 'View placement state history',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().get(`/placements/${id}/state-history`, undefined, correlationId);
        return reply.send(data);
    });

    // View guarantee details
    app.get('/api/placements/:id/guarantee', {
        schema: {
            description: 'View guarantee details',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().get(`/placements/:id/guarantee`, undefined, correlationId);
        return reply.send(data);
    });

    // Extend guarantee period
    app.post('/api/placements/:id/guarantee/extend', {
        preHandler: requireRoles(['company_admin', 'platform_admin']),
        schema: {
            description: 'Extend guarantee period',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().post(`/placements/${id}/guarantee/extend`, request.body, correlationId);
        return reply.send(data);
    });

    // ==========================================
    // Phase 2 Routes - Placement Collaboration
    // ==========================================

    // Add collaborators
    app.post('/api/placements/:id/collaborators', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'platform_admin']),
        schema: {
            description: 'Add collaborators to placement',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().post(`/placements/${id}/collaborators`, request.body, correlationId);
        return reply.send(data);
    });

    // View placement collaborators
    app.get('/api/placements/:id/collaborators', {
        schema: {
            description: 'View placement collaborators',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().get(`/placements/${id}/collaborators`, undefined, correlationId);
        return reply.send(data);
    });

    // Update collaborator split
    app.patch('/api/placements/:id/collaborators/:recruiter_id', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'platform_admin']),
        schema: {
            description: 'Update collaborator split',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id, recruiter_id } = request.params as { id: string; recruiter_id: string };
        const correlationId = getCorrelationId(request);
        const data = await atsService().patch(`/placements/${id}/collaborators/${recruiter_id}`, request.body, correlationId);
        return reply.send(data);
    });

    // Calculate placement splits preview
    app.post('/api/placements/calculate-splits', {
        schema: {
            description: 'Calculate placement splits preview',
            tags: ['placements'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const data = await atsService().post('/placements/calculate-splits', request.body, correlationId);
        return reply.send(data);
    });
}
