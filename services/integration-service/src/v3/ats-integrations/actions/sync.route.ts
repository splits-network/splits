/**
 * ATS Integration Action Routes
 * POST /sync, GET /sync-logs, GET /stats, POST /push-candidate
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { CryptoService } from '@splits-network/shared-config/src/crypto';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { ATSRepositoryAdapter } from '../ats-adapter.js';
import { ATSService, SetupATSParams } from '../../../v2/ats/service.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

interface ATSActionConfig {
  supabase: SupabaseClient;
  eventPublisher: IEventPublisher;
  logger: Logger;
  crypto: CryptoService;
}

export function registerATSActionRoutes(app: FastifyInstance, config: ATSActionConfig) {
  const adapter = new ATSRepositoryAdapter(config.supabase);
  const service = new ATSService(adapter as any, config.eventPublisher, config.logger, config.crypto);

  // POST /api/v3/integrations/ats/:id/sync
  app.post('/api/v3/integrations/ats/:id/sync', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };

    try {
      const result = await service.triggerSync(id);
      return reply.send({ data: result });
    } catch (err: any) {
      config.logger.error({ err, id }, 'Failed to trigger ATS sync');
      const status = err.message.includes('not found') ? 404
        : err.message.includes('not enabled') ? 422
        : 500;
      return reply.status(status).send({ error: err.message });
    }
  });

  // GET /api/v3/integrations/ats/:id/sync-logs
  app.get('/api/v3/integrations/ats/:id/sync-logs', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const query = request.query as { limit?: string; offset?: string; status?: string };

    try {
      const logs = await service.getSyncLogs(id, {
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
        status: query.status,
      });
      return reply.send({ data: logs });
    } catch (err: any) {
      config.logger.error({ err, id }, 'Failed to get sync logs');
      return reply.status(500).send({ error: err.message });
    }
  });

  // GET /api/v3/integrations/ats/:id/stats
  app.get('/api/v3/integrations/ats/:id/stats', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };

    try {
      const stats = await service.getSyncStats(id);
      return reply.send({ data: stats });
    } catch (err: any) {
      config.logger.error({ err, id }, 'Failed to get sync stats');
      return reply.status(500).send({ error: err.message });
    }
  });

  // POST /api/v3/integrations/ats/:id/push-candidate
  app.post('/api/v3/integrations/ats/:id/push-candidate', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const body = request.body as {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      job_external_id?: string;
    };

    if (!body.first_name || !body.last_name || !body.email) {
      return reply.status(400).send({ error: 'first_name, last_name, and email are required' });
    }

    try {
      const result = await service.pushCandidateToATS(id, body);
      return reply.status(result.success ? 201 : 422).send({ data: result });
    } catch (err: any) {
      config.logger.error({ err, id }, 'Failed to push candidate to ATS');
      return reply.status(500).send({ error: err.message });
    }
  });
}
