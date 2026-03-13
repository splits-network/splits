/**
 * Hire Routes — Offer acceptance and hiring
 */

import { FastifyInstance } from 'fastify';
import { HireService } from './hire.service';
import { idParamSchema } from '../types';

export function registerHireRoutes(app: FastifyInstance, service: HireService) {
  // POST /api/v3/applications/:id/accept-offer
  app.post('/api/v3/applications/:id/accept-offer', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const data = await service.acceptOffer(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/applications/:id/hire
  app.post('/api/v3/applications/:id/hire', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const body = request.body as { salary: number; start_date?: string; notes?: string };
    const data = await service.hireCandidate(id, body, clerkUserId);
    return reply.send({ data });
  });
}
