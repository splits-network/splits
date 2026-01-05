import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { requireAuth } from '../../rbac';
import {
    ResourceDefinition,
    registerResourceRoutes,
    getCorrelationId,
    buildQueryString,
} from './common';

const ATS_RESOURCES: ResourceDefinition[] = [
    {
        name: 'jobs',
        service: 'ats',
        basePath: '/jobs',
        tag: 'jobs',
    },
    {
        name: 'companies',
        service: 'ats',
        basePath: '/companies',
        tag: 'companies',
    },
    {
        name: 'candidates',
        service: 'ats',
        basePath: '/candidates',
        tag: 'candidates',
    },
    {
        name: 'applications',
        service: 'ats',
        basePath: '/applications',
        tag: 'applications',
    },
    {
        name: 'placements',
        service: 'ats',
        basePath: '/placements',
        tag: 'placements',
    },
    {
        name: 'job-pre-screen-questions',
        service: 'ats',
        basePath: '/job-pre-screen-questions',
        tag: 'job-pre-screen-questions',
    },
    {
        name: 'job-pre-screen-answers',
        service: 'ats',
        basePath: '/job-pre-screen-answers',
        tag: 'job-pre-screen-answers',
    },
    {
        name: 'job-requirements',
        service: 'ats',
        basePath: '/job-requirements',
        tag: 'job-requirements',
    },
];

export function registerAtsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    // Register standard CRUD routes for most resources (excluding jobs and candidates)
    ATS_RESOURCES.filter(r => r.name !== 'candidates' && r.name !== 'jobs').forEach(resource => 
        registerResourceRoutes(app, services, resource)
    );
    
    // Register custom routes with special handling
    registerJobRoutes(app, services);
    registerCandidateRoutes(app, services);
    
    registerStatsRoutes(app, services);
    registerAiReviewRoutes(app, services);
}

function registerJobRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');
    const apiBase = `/api/v2/jobs`;
    const serviceBase = `/api/v2/jobs`;

    // LIST jobs (PUBLIC - no authentication required)
    app.get(
        apiBase,
        // No preHandler - public endpoint handled by global auth middleware
        async (request: FastifyRequest, reply: FastifyReply) => {
            console.log(`[Gateway V2] ${apiBase} - Public jobs request received`);
            console.log(`[Gateway V2] Query:`, request.query);
            
            const correlationId = getCorrelationId(request);
            
            // Build auth headers if user is authenticated, empty if not
            const authHeaders = buildAuthHeaders(request);
            console.log(`[Gateway V2] Auth headers:`, authHeaders);
            
            const data = await atsService().get(
                serviceBase,
                request.query as Record<string, any>,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );

    // GET job by ID (PUBLIC - no authentication required)  
    app.get(
        `${apiBase}/:id`,
        // No preHandler - public endpoint handled by global auth middleware
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            console.log(`[Gateway V2] ${apiBase}/${id} - Public job details request received`);
            
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `${serviceBase}/${id}?${queryString}` : `${serviceBase}/${id}`;
            
            // Build auth headers if user is authenticated, empty if not
            const authHeaders = buildAuthHeaders(request);
            
            const data = await atsService().get(
                path,
                undefined,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );

    // CREATE, UPDATE, DELETE jobs still require authentication
    app.post(
        apiBase,
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const data = await atsService().post(
                serviceBase,
                request.body,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );

    app.patch(
        `${apiBase}/:id`,
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await atsService().patch(
                `${serviceBase}/${id}`,
                request.body,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );

    app.delete(
        `${apiBase}/:id`,
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await atsService().delete(
                `${serviceBase}/${id}`,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );
}

function registerCandidateRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');
    const networkService = () => services.get('network');
    const identityService = () => services.get('identity');

    // Standard resource routes for candidates (LIST, GET, UPDATE, DELETE)
    const candidateResource = ATS_RESOURCES.find(r => r.name === 'candidates')!;
    const apiBase = `/api/v2${candidateResource.basePath}`;
    const serviceBase = `/api/v2${candidateResource.basePath}`;

    // LIST candidates
    app.get(
        apiBase,
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            
            try {
                const data = await atsService().get(
                    serviceBase,
                    request.query as Record<string, any>,
                    correlationId,
                    authHeaders
                );
                
                return reply.send(data);
            } catch (error) {
                console.error(`[DEBUG CANDIDATES] ServiceClient error:`, error);
                throw error;
            }
        }
    );

    // GET candidate by ID
    app.get(
        `${apiBase}/:id`,
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `${serviceBase}/${id}?${queryString}` : `${serviceBase}/${id}`;
            const data = await atsService().get(
                path,
                undefined,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );

    // CREATE candidate (with orchestration)
    app.post(
        apiBase,
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            
            if (!request.auth?.clerkUserId) {
                return reply.code(401).send({ error: 'Authentication required' });
            }
            
            const clerkUserId = request.auth.clerkUserId;

            try {
                // Step 1: Create candidate in ATS service
                const candidateResponse = await atsService().post(
                    serviceBase,
                    request.body,
                    correlationId,
                    authHeaders
                ) as { data?: any };

                const candidate = candidateResponse.data || candidateResponse;
                
                // Step 2: Get the recruiter's internal ID from network service
                let recruiterId = null;
                try {
                    const recruiterResponse = await networkService().get(
                        `/api/v2/recruiters?limit=1`,
                        {},
                        correlationId,
                        authHeaders
                    ) as { data?: any[] };
                    const recruiters = (recruiterResponse.data || []);
                    if (recruiters.length > 0) {
                        recruiterId = recruiters[0].id; // Use the network.recruiters.id
                    }
                } catch (recruiterError) {
                    // User might not be a recruiter, that's okay
                    request.log.info({ clerkUserId }, 'User is not a recruiter, skipping recruiter-candidate relationship');
                }

                // Step 3: Create recruiter-candidate relationship if user is a recruiter
                if (recruiterId && candidate.id) {
                    try {
                        await networkService().post(
                            `/api/v2/recruiter-candidates`,
                            {
                                recruiter_id: recruiterId,
                                candidate_id: candidate.id
                            },
                            correlationId,
                            authHeaders
                        );
                        request.log.info({ 
                            candidateId: candidate.id, 
                            recruiterId,
                            clerkUserId 
                        }, 'Created recruiter-candidate relationship');
                    } catch (relationshipError: any) {
                        // Log but don't fail the candidate creation
                        request.log.error({ 
                            error: relationshipError, 
                            candidateId: candidate.id, 
                            recruiterId,
                            clerkUserId 
                        }, 'Failed to create recruiter-candidate relationship');
                    }
                }

                return reply.code(201).send(candidateResponse);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to create candidate');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to create candidate' });
            }
        }
    );

    // UPDATE candidate
    app.patch(
        `${apiBase}/:id`,
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await atsService().patch(
                `${serviceBase}/${id}`,
                request.body,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );

    // DELETE candidate
    app.delete(
        `${apiBase}/:id`,
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const data = await atsService().delete(
                `${serviceBase}/${id}`,
                correlationId,
                buildAuthHeaders(request)
            );
            return reply.send(data);
        }
    );
}

function registerStatsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const atsService = () => services.get('ats');

    app.get(
        '/api/v2/stats',
        {
            preHandler: requireAuth(),
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/stats?${queryString}` : '/api/v2/stats';
            try {
                const data = await atsService().get(path, undefined, correlationId, authHeaders);
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch stats');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to load stats' });
            }
        }
    );
}

function registerAiReviewRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const aiService = () => services.get('ai');

    app.get(
        '/api/v2/ai-reviews',
        {
            preHandler: requireAuth(),
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = buildQueryString(request.query as Record<string, any>);
            const path = queryString ? `/api/v2/ai-reviews?${queryString}` : '/api/v2/ai-reviews';

            try {
                const data = await aiService().get(path, undefined, correlationId, authHeaders);
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch AI review');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to fetch AI review' });
            }
        }
    );

    app.get(
        '/api/v2/ai-reviews/:id',
        {
            preHandler: requireAuth(),
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await aiService().get(
                    `/api/v2/ai-reviews/${id}`,
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, id, correlationId }, 'Failed to fetch AI review');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to fetch AI review' });
            }
        }
    );

    app.post(
        '/api/v2/ai-reviews',
        {
            preHandler: requireAuth(),
            // No schema needed for Fastify 5.x
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await aiService().post(
                    '/api/v2/ai-reviews',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to trigger AI review');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: 'Failed to trigger AI review' });
            }
        }
    );
}
