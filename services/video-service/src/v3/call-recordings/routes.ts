/**
 * Call Recordings V3 Routes
 * Read-only access to recordings + playback URLs.
 * Start/stop/webhook stay in V2 (LiveKit SDK coupling).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CallRecordingRepository } from './repository';
import { CallRecordingService } from './service';
import {
  CallRecordingListParams,
  callRecordingListQuerySchema,
  callIdParamSchema,
  playbackQuerySchema,
} from './types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerCallRecordingRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CallRecordingRepository(supabase);
  const service = new CallRecordingService(repository, supabase);

  // GET /api/v3/call-recordings
  app.get('/api/v3/call-recordings', {
    schema: { querystring: callRecordingListQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.list(request.query as CallRecordingListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/call-recordings/:id/playback-url
  app.get('/api/v3/call-recordings/:id/playback-url', {
    schema: { params: callIdParamSchema, querystring: playbackQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const { recording_id } = request.query as { recording_id?: string };
    const data = await service.getPlaybackUrl(id, clerkUserId, recording_id);
    return reply.send({ data });
  });
}
