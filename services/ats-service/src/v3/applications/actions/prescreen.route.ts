/**
 * Prescreen Routes — Pre-screen requests and reactivation
 */

import { FastifyInstance } from 'fastify';
import { PrescreenService } from './prescreen.service';
import { idParamSchema } from '../types';

export function registerPrescreenRoutes(app: FastifyInstance, service: PrescreenService) {
  // POST /api/v3/applications/:id/request-prescreen
  app.post('/api/v3/applications/:id/request-prescreen', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const body = request.body as { company_id: string; recruiter_id?: string; message?: string };
    const data = await service.requestPrescreen(id, body, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/applications/:id/reactivate
  app.post('/api/v3/applications/:id/reactivate', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const data = await service.reactivateApplication(id, clerkUserId);
    return reply.send({ data });
  });
}
