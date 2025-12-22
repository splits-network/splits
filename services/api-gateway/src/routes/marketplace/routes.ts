import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { AuthenticatedRequest } from '../../rbac';

/**
 * Marketplace Routes (API Gateway)
 * - Public marketplace browsing
 * - Connection requests
 * - Marketplace messaging
 * - Recruiter marketplace settings
 */
export function registerMarketplaceRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const networkService = () => services.get('network');

    // ========================================================================
    // Public Marketplace Routes (No auth required for browsing)
    // ========================================================================

    // Search/browse marketplace recruiters
    app.get('/api/marketplace/recruiters', {
        schema: {
            description: 'Browse recruiters in the marketplace (public)',
            tags: ['marketplace'],
            querystring: {
                type: 'object',
                properties: {
                    industries: { type: 'string', description: 'Comma-separated list of industries' },
                    specialties: { type: 'string', description: 'Comma-separated list of specialties' },
                    location: { type: 'string' },
                    search: { type: 'string', description: 'Text search' },
                    page: { type: 'number', default: 1 },
                    limit: { type: 'number', default: 25 },
                    sort_by: { type: 'string', enum: ['reputation_score', 'total_placements', 'created_at', 'years_experience'] },
                    sort_order: { type: 'string', enum: ['asc', 'desc'] },
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const data = await networkService().get('/marketplace/recruiters', request.query as Record<string, any>);
        return reply.send(data);
    });

    // Get single marketplace recruiter profile
    app.get('/api/marketplace/recruiters/:id', {
        schema: {
            description: 'Get recruiter marketplace profile (public)',
            tags: ['marketplace'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' },
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const data = await networkService().get(`/marketplace/recruiters/${id}`);
        return reply.send(data);
    });

    // ========================================================================
    // Recruiter Marketplace Settings (Requires auth + recruiter role)
    // ========================================================================

    // Get own marketplace settings
    app.get('/api/recruiters/me/marketplace', {
        schema: {
            description: 'Get own marketplace settings',
            tags: ['marketplace', 'recruiters'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        
        // Get recruiter ID from user's profile
        let recruiterResponse = await networkService().get(`/recruiters/by-user/${req.auth.userId}`);
        let recruiter = (recruiterResponse as any).data;

        // If recruiter doesn't exist, create one automatically
        if (!recruiter) {
            const createResponse = await networkService().post('/recruiters', {
                user_id: req.auth.userId,
                bio: '',
            });
            recruiter = (createResponse as any).data;
        }

        if (!recruiter) {
            return reply.status(500).send({
                error: {
                    code: 'RECRUITER_CREATION_FAILED',
                    message: 'Failed to create recruiter profile',
                },
            });
        }

        const data = await networkService().get(`/recruiters/${recruiter.id}/marketplace`);
        return reply.send(data);
    });

    // Update own marketplace settings
    app.patch('/api/recruiters/me/marketplace', {
        schema: {
            description: 'Update own marketplace settings',
            tags: ['marketplace', 'recruiters'],
            security: [{ clerkAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    marketplace_enabled: { type: 'boolean' },
                    marketplace_visibility: { type: 'string', enum: ['public', 'limited', 'hidden'] },
                    industries: { type: 'array', items: { type: 'string' } },
                    specialties: { type: 'array', items: { type: 'string' } },
                    location: { type: 'string' },
                    tagline: { type: 'string', maxLength: 255 },
                    years_experience: { type: 'number', minimum: 0 },
                    marketplace_profile: { type: 'object' },
                    show_success_metrics: { type: 'boolean' },
                    show_contact_info: { type: 'boolean' },
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        
        // Get recruiter ID from user's profile
        const recruiterResponse = await networkService().get(`/recruiters/by-user/${req.auth.userId}`);
        const recruiter = (recruiterResponse as any).data;

        if (!recruiter) {
            return reply.status(404).send({
                error: {
                    code: 'RECRUITER_NOT_FOUND',
                    message: 'Recruiter profile not found',
                },
            });
        }

        // Check subscription requirement if enabling marketplace
        const body = request.body as any;
        if (body.marketplace_enabled) {
            // This would call billing service to check subscription
            // For now, allow it
        }

        const data = await networkService().patch(`/recruiters/${recruiter.id}/marketplace`, request.body);
        return reply.send(data);
    });

    // ========================================================================
    // Connection Requests (Requires auth)
    // ========================================================================

    // Create connection request (candidate to recruiter)
    app.post('/api/marketplace/connections', {
        schema: {
            description: 'Request connection with a recruiter',
            tags: ['marketplace'],
            security: [{ clerkAuth: [] }],
            body: {
                type: 'object',
                required: ['recruiter_id'],
                properties: {
                    recruiter_id: { type: 'string' },
                    message: { type: 'string', maxLength: 1000 },
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const body = request.body as { recruiter_id: string; message?: string };

        // Pass user ID in the request body
        const data = await networkService().post('/marketplace/connections', {
            recruiter_id: body.recruiter_id,
            message: body.message,
            user_id: req.auth.userId,
        });
        return reply.status(201).send(data);
    });

    // Get candidate's connections
    app.get('/api/marketplace/connections/me', {
        schema: {
            description: 'Get my marketplace connections',
            tags: ['marketplace'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;

        const data = await networkService().get(`/marketplace/connections/user/${req.auth.userId}`);
        return reply.send(data);
    });

    // Get recruiter's connection requests
    app.get('/api/recruiters/me/connections', {
        schema: {
            description: 'Get connection requests to my profile',
            tags: ['marketplace', 'recruiters'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;

        // Get recruiter ID from user's profile
        const recruiterResponse = await networkService().get(`/recruiters/by-user/${req.auth.userId}`);
        const recruiter = (recruiterResponse as any).data?.data;

        if (!recruiter) {
            return reply.status(404).send({
                error: {
                    code: 'RECRUITER_NOT_FOUND',
                    message: 'Recruiter profile not found',
                },
            });
        }

        const data = await networkService().get(`/recruiters/${recruiter.id}/connections`);
        return reply.send(data);
    });

    // Respond to connection request (recruiter accepts/declines)
    app.patch('/api/marketplace/connections/:id', {
        schema: {
            description: 'Respond to connection request (accept/decline)',
            tags: ['marketplace'],
            security: [{ clerkAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' },
                },
            },
            body: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['accepted', 'declined'] },
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { id } = request.params as { id: string };
        const body = request.body as { status: 'accepted' | 'declined' };

        // Verify user is the recruiter for this connection
        // This would be done in the network service

        const data = await networkService().patch(`/marketplace/connections/${id}`, {
            status: body.status,
            user_id: req.auth.userId,
        });
        return reply.send(data);
    });

    // ========================================================================
    // Messaging (Requires auth + connection)
    // ========================================================================

    // Send message in a connection
    app.post('/api/marketplace/connections/:id/messages', {
        schema: {
            description: 'Send message in a connection',
            tags: ['marketplace'],
            security: [{ clerkAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' },
                },
            },
            body: {
                type: 'object',
                required: ['message'],
                properties: {
                    message: { type: 'string', maxLength: 5000 },
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { id } = request.params as { id: string };
        const body = request.body as { message: string };

        const data = await networkService().post(`/marketplace/connections/${id}/messages`, {
            message: body.message,
            user_id: req.auth.userId,
        });
        return reply.status(201).send(data);
    });

    // Get messages for a connection
    app.get('/api/marketplace/connections/:id/messages', {
        schema: {
            description: 'Get messages for a connection',
            tags: ['marketplace'],
            security: [{ clerkAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' },
                },
            },
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const { id } = request.params as { id: string };

        const data = await networkService().get(`/marketplace/connections/${id}/messages`, {
            user_id: req.auth.userId,
        });
        return reply.send(data);
    });
}
