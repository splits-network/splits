/**
 * POST /api/v3/call-recordings/:id/actions/stop
 *
 * Instance-level action: stops an active recording egress.
 * Host-only.
 */

import { FastifyInstance } from 'fastify';
import { StopRecordingService } from './stop.service';
import { CallRecordingRoutesConfig } from '../routes';
import { idParamSchema } from '../types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerStopAction(app: FastifyInstance, config: CallRecordingRoutesConfig) {
  const service = new StopRecordingService(
    config.supabase,
    config.livekitApiKey,
    config.livekitApiSecret,
    config.livekitWsUrl,
    config.eventPublisher,
  );

  app.post('/api/v3/call-recordings/:id/actions/stop', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);

    const { id } = request.params as { id: string };
    const data = await service.stop(id, clerkUserId);
    return reply.send({ data });
  });
}
