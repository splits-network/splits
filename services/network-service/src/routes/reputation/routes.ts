import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RecruiterReputationService } from '../../services/reputation/service';

/**
 * Reputation Routes (Phase 2)
 * - Recruiter reputation metrics
 * - Leaderboards
 */
export function registerReputationRoutes(
    app: FastifyInstance,
    reputationService: RecruiterReputationService
) {
    // Get recruiter reputation
    app.get(
        '/recruiters/:recruiterId/reputation',
        {
            schema: {
                tags: ['phase2-reputation'],
                summary: 'Get reputation metrics for a recruiter',
            }
        },
        async (
            request: FastifyRequest<{ Params: { recruiterId: string } }>,
            reply: FastifyReply
        ) => {
            const reputation = await reputationService.getRecruiterReputation(
                request.params.recruiterId
            );
            return reply.send({ data: reputation });
        }
    );

    // Recalculate recruiter reputation (admin endpoint)
    app.post(
        '/recruiters/:recruiterId/reputation/recalculate',
        {
            schema: {
                tags: ['phase2-reputation'],
                summary: 'Manually trigger reputation recalculation',
            }
        },
        async (
            request: FastifyRequest<{ Params: { recruiterId: string } }>,
            reply: FastifyReply
        ) => {
            const reputation = await reputationService.recalculateReputation(
                request.params.recruiterId
            );
            return reply.send({ data: reputation });
        }
    );

    // Get top recruiters leaderboard
    app.get(
        '/reputation/leaderboard',
        {
            schema: {
                tags: ['phase2-reputation'],
                summary: 'Get top recruiters by reputation score',
                querystring: {
                    type: 'object',
                    properties: {
                        limit: { type: 'number', default: 10 }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{ Querystring: { limit?: string } }>,
            reply: FastifyReply
        ) => {
            const limit = request.query.limit ? parseInt(request.query.limit) : 10;
            const topRecruiters = await reputationService.getTopRecruiters(limit);
            return reply.send({ data: topRecruiters });
        }
    );

    // Record placement outcome (internal/event-driven endpoint)
    app.post(
        '/recruiters/:recruiterId/reputation/placement-outcome',
        {
            schema: {
                tags: ['phase2-reputation'],
                summary: 'Record a placement outcome for reputation calculation',
                body: {
                    type: 'object',
                    required: ['completed', 'was_collaboration'],
                    properties: {
                        completed: { type: 'boolean' },
                        was_collaboration: { type: 'boolean' }
                    }
                }
            }
        },
        async (
            request: FastifyRequest<{
                Params: { recruiterId: string };
                Body: { completed: boolean; was_collaboration: boolean };
            }>,
            reply: FastifyReply
        ) => {
            const { recruiterId } = request.params;
            const { completed, was_collaboration } = request.body;

            await reputationService.recordPlacementOutcome(
                recruiterId,
                completed,
                was_collaboration
            );

            return reply.send({ data: { message: 'Outcome recorded' } });
        }
    );
}
