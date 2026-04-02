/**
 * Link Session Action Route
 * POST /api/v3/support/conversations/actions/link-session
 *
 * Links anonymous visitor sessions to authenticated users.
 * This is an action (not CRUD) because it queries the users table
 * and performs cross-table updates.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { LinkSessionService } from './link-session.service.js';

export function registerLinkSessionAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const service = new LinkSessionService(supabase);

  app.post('/api/v3/support/conversations/actions/link-session', async (request, reply) => {
    const body = request.body as { session_id?: string } | undefined;
    const sessionId = body?.session_id ||
      (request.headers['x-support-session-id'] as string | undefined);
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;

    if (!sessionId) {
      return reply.status(400).send({
        error: { code: 'BAD_REQUEST', message: 'session_id required' },
      });
    }

    if (clerkUserId) {
      await service.linkSession(sessionId, clerkUserId);
    }

    return reply.send({ data: { status: 'ok' } });
  });
}
