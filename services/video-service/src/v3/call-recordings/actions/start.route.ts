/**
 * POST /api/v3/call-recordings/actions/start
 *
 * Collection-level action: starts a recording for a call.
 * Requires call_id in the body. Host-only.
 */

import { FastifyInstance } from 'fastify';
import { StartRecordingService } from './start.service';
import { CallRecordingRoutesConfig } from '../routes';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

const bodySchema = {
  type: 'object',
  required: ['call_id'],
  properties: {
    call_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export function registerStartAction(app: FastifyInstance, config: CallRecordingRoutesConfig) {
  const service = new StartRecordingService(
    config.supabase,
    config.s3Config,
    config.livekitApiKey,
    config.livekitApiSecret,
    config.livekitWsUrl,
    config.eventPublisher,
  );

  app.post('/api/v3/call-recordings/actions/start', {
    schema: { body: bodySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);

    const { call_id } = request.body as { call_id: string };
    const data = await service.start(call_id, clerkUserId);
    return reply.send({ data });
  });
}
