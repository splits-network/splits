import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { requireUserContext } from '../shared/access';
import { StatsServiceV2 } from './service';
import { StatsQueryParams } from './types';

interface RegisterStatsRoutesConfig {
    statsService: StatsServiceV2;
}

export function registerStatsRoutes(app: FastifyInstance, config: RegisterStatsRoutesConfig) {
    /**
     * GET /v2/stats
     * Get statistics for the current user's scope (recruiter/candidate/company/platform)
     * Query params:
     * - scope: 'recruiter' | 'candidate' | 'company' | 'platform' (default: 'recruiter')
     * - range: '7d' | '30d' | '90d' | 'ytd' | 'mtd' | 'all' (default: 'ytd')
     */
    app.get(
        '/api/v2/stats',
        {
            schema: {
                tags: ['Stats'],
                description: 'Get user statistics from pre-aggregated metrics',
                querystring: {
                    type: 'object',
                    properties: {
                        scope: {
                            type: 'string',
                            enum: ['recruiter', 'candidate', 'company', 'platform'],
                            description: 'Statistics scope',
                        },
                        range: {
                            type: 'string',
                            description: 'Time range (7d, 30d, 90d, ytd, mtd, all)',
                        },
                    },
                },
                response: {
                    200: {
                        description: 'Statistics retrieved successfully',
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                properties: {
                                    scope: { type: 'string' },
                                    range: {
                                        type: 'object',
                                        properties: {
                                            label: { type: 'string' },
                                            from: { type: 'string' },
                                            to: { type: 'string' },
                                        },
                                    },
                                    metrics: { 
                                        type: 'object',
                                        additionalProperties: true  // Allow dynamic metric fields
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Querystring: StatsQueryParams }>,
            reply: FastifyReply
        ) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const stats = await config.statsService.getStats(clerkUserId, request.query || {});
                const response = { data: stats };
                return reply.send(response);
            } catch (error: any) {
                console.error('[Stats Error]', error?.message || error);
                return reply
                    .code(error?.message?.includes('required') ? 403 : 400)
                    .send({ error: { message: error?.message || 'Failed to load stats' } });
            }
        }
    );
}
