/**
 * AI Review Routes — Trigger, return to draft, submit
 */

import { FastifyInstance } from 'fastify';
import { AIReviewService } from './ai-review.service.js';
import { idParamSchema } from '../types.js';

export function registerAIReviewRoutes(app: FastifyInstance, service: AIReviewService) {
  // POST /api/v3/applications/:id/trigger-ai-review
  app.post('/api/v3/applications/:id/trigger-ai-review', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    await service.triggerReview(id, clerkUserId);
    return reply.send({ data: { message: 'AI review triggered successfully' } });
  });

  // POST /api/v3/applications/:id/return-to-draft
  app.post('/api/v3/applications/:id/return-to-draft', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const data = await service.returnToDraft(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/applications/:id/submit
  app.post('/api/v3/applications/:id/submit', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const data = await service.submitApplication(id, clerkUserId);
    return reply.send({ data });
  });
}
