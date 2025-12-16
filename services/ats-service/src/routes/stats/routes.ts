import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AtsService } from '../../service';

export function registerStatsRoutes(app: FastifyInstance, service: AtsService) {
    // Get stats for admin dashboard
    app.get(
        '/stats',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const stats = await service.getStats();
            return reply.send({ data: stats });
        }
    );
}
