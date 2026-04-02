/**
 * GET /api/v3/presence/views/batch-status
 *
 * Batch lookup of user online/idle/offline status from Redis.
 * Accepts userIds as comma-separated string or array query param.
 */

import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { BatchStatusRepository } from './batch-status.repository.js';
import { BatchStatusService } from './batch-status.service.js';
import { batchStatusQuerySchema, BatchStatusQuery } from '../types.js';

export function registerBatchStatusView(app: FastifyInstance, redis: Redis) {
  const repository = new BatchStatusRepository(redis);
  const service = new BatchStatusService(repository);

  app.get('/api/v3/presence/views/batch-status', {
    schema: { querystring: batchStatusQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const query = request.query as BatchStatusQuery;
    const result = await service.getBatchStatus(query.userIds);

    reply.header('Cache-Control', 'private, max-age=5');
    return reply.send(result);
  });
}
