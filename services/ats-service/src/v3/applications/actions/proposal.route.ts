/**
 * Proposal Routes — Recruiter proposes jobs to candidates
 */

import { FastifyInstance } from 'fastify';
import { ProposalService } from './proposal.service';
import { idParamSchema } from '../types';

export function registerProposalRoutes(app: FastifyInstance, service: ProposalService) {
  // POST /api/v3/applications/propose
  app.post('/api/v3/applications/propose', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const body = request.body as {
      candidate_recruiter_id: string;
      candidate_id: string;
      job_id: string;
      pitch?: string;
      notes?: string;
    };

    const data = await service.proposeJobToCandidate(body, clerkUserId);
    return reply.code(201).send({ data });
  });

  // POST /api/v3/applications/:id/accept-proposal
  app.post('/api/v3/applications/:id/accept-proposal', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const data = await service.acceptProposal(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/applications/:id/decline-proposal
  app.post('/api/v3/applications/:id/decline-proposal', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const body = request.body as { reason?: string } | undefined;
    const data = await service.declineProposal(id, clerkUserId, body?.reason);
    return reply.send({ data });
  });
}
