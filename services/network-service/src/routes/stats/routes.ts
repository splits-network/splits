import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NetworkService } from '../../service';

/**
 * Stats Routes
 * - Service-wide statistics
 */
export function registerStatsRoutes(app: FastifyInstance, service: NetworkService) {
    // Get service stats
    app.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
        const stats = await service.getStats();
        return reply.send({ data: stats });
    });
}
