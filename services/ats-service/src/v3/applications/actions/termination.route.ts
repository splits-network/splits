/**
 * Termination Routes — Handle recruiter-candidate relationship termination
 */

import { FastifyInstance } from 'fastify';
import { TerminationService } from './termination.service';

export function registerTerminationRoutes(app: FastifyInstance, service: TerminationService) {
  // GET /api/v3/applications/affected-by-termination
  app.get('/api/v3/applications/affected-by-termination', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const query = request.query as { recruiter_id?: string; candidate_id?: string };
    if (!query.recruiter_id || !query.candidate_id) {
      return reply.status(400).send({
        error: { message: 'recruiter_id and candidate_id are required' },
      });
    }

    const data = await service.getAffectedByTermination(query.recruiter_id, query.candidate_id);
    return reply.send({ data });
  });

  // POST /api/v3/applications/termination-decisions
  app.post('/api/v3/applications/termination-decisions', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const body = request.body as {
      decisions: { application_id: string; action: 'keep' | 'withdraw' }[];
    };
    if (!body.decisions || !Array.isArray(body.decisions)) {
      return reply.status(400).send({
        error: { message: 'decisions array is required' },
      });
    }

    await service.processDecisions(body.decisions, clerkUserId);
    return reply.send({ data: { message: 'Termination decisions processed' } });
  });
}
