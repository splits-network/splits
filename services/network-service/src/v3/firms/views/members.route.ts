/**
 * Firm Members View Route
 * GET /api/v3/firms/:firmId/views/members
 *
 * Returns firm members with recruiter + user joins.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { FirmMembersViewRepository } from './members.repository.js';
import { FirmMembersViewService } from './members.service.js';
import { FirmMemberListParams, firmIdParamSchema } from '../types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerFirmMembersView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new FirmMembersViewRepository(supabase);
  const service = new FirmMembersViewService(repository);

  app.get('/api/v3/firms/:firmId/views/members', {
    schema: { params: firmIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { firmId } = request.params as { firmId: string };
    const query = request.query as FirmMemberListParams;
    const result = await service.getMembers(firmId, query);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
