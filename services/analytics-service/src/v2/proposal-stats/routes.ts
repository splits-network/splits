import { FastifyInstance } from 'fastify';
import { ProposalStatsService } from './service';

export function registerProposalStatsRoutes(app: FastifyInstance, service: ProposalStatsService) {
    /**
     * GET /api/v2/proposal-stats/summary
     * 
     * Returns summary statistics for proposals requiring recruiter attention
     */
    app.get('/api/v2/proposal-stats/summary', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;

        if (!clerkUserId) {
            return reply.code(401).send({ 
                error: { 
                    code: 'UNAUTHORIZED', 
                    message: 'Missing user authentication' 
                } 
            });
        }

        try {
            const summary = await service.getSummary(clerkUserId, {});
            return reply.send({ data: summary });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            request.log.error({ error: errorMessage, stack: errorStack }, 'Failed to fetch proposal summary');
            return reply.code(500).send({ 
                error: { 
                    code: 'INTERNAL_ERROR', 
                    message: 'Failed to fetch proposal summary statistics' 
                } 
            });
        }
    });
}
