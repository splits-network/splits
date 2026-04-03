/**
 * GET /api/v3/call-recordings/:id/view/playback
 *
 * Returns a signed playback URL for a recording.
 * Requires auth + participant verification.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PlaybackRepository } from './playback.repository.js';
import { PlaybackService } from './playback.service.js';
import { idParamSchema } from '../types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerPlaybackView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new PlaybackRepository(supabase);
  const service = new PlaybackService(repository, supabase);

  app.get('/api/v3/call-recordings/:id/view/playback', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);

    const { id } = request.params as { id: string };
    const data = await service.getPlaybackUrl(id, clerkUserId);
    reply.header('Cache-Control', 'private, no-store');
    return reply.send({ data });
  });
}
