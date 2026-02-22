import { FastifyInstance } from 'fastify';
import { ATSRepository } from './repository';
import { ATSService, SetupATSParams } from './service';
import { IEventPublisher } from '../shared/events';
import { requireUserContext } from '../shared/helpers';
import { Logger } from '@splits-network/shared-logging';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: IEventPublisher;
    logger: Logger;
}

export async function registerATSRoutes(app: FastifyInstance, config: RegisterConfig) {
    const repo = new ATSRepository(config.supabaseUrl, config.supabaseKey);
    const service = new ATSService(repo, config.eventPublisher, config.logger);

    // GET /api/v2/integrations/ats?company_id=...
    app.get('/api/v2/integrations/ats', async (request, reply) => {
        requireUserContext(request);
        const { company_id } = request.query as { company_id?: string };

        if (!company_id) {
            return reply.status(400).send({ error: 'company_id is required' });
        }

        try {
            const integrations = await service.listIntegrations(company_id);
            return reply.send({ data: integrations });
        } catch (err: any) {
            config.logger.error({ err }, 'Failed to list ATS integrations');
            return reply.status(500).send({ error: err.message });
        }
    });

    // GET /api/v2/integrations/ats/:id
    app.get('/api/v2/integrations/ats/:id', async (request, reply) => {
        requireUserContext(request);
        const { id } = request.params as { id: string };

        try {
            const integration = await service.getIntegration(id);
            if (!integration) return reply.status(404).send({ error: 'Integration not found' });
            return reply.send({ data: integration });
        } catch (err: any) {
            config.logger.error({ err, id }, 'Failed to get ATS integration');
            return reply.status(500).send({ error: err.message });
        }
    });

    // POST /api/v2/integrations/ats — setup new ATS connection
    app.post('/api/v2/integrations/ats', async (request, reply) => {
        requireUserContext(request);
        const body = request.body as SetupATSParams;

        if (!body.company_id || !body.platform || !body.api_key) {
            return reply.status(400).send({
                error: 'company_id, platform, and api_key are required',
            });
        }

        try {
            const integration = await service.setupIntegration(body);
            return reply.status(201).send({ data: integration });
        } catch (err: any) {
            config.logger.error({ err }, 'Failed to setup ATS integration');
            const status = err.message.includes('Already connected') ? 409
                : err.message.includes('validation failed') ? 422
                : 500;
            return reply.status(status).send({ error: err.message });
        }
    });

    // PATCH /api/v2/integrations/ats/:id — update settings
    app.patch('/api/v2/integrations/ats/:id', async (request, reply) => {
        requireUserContext(request);
        const { id } = request.params as { id: string };
        const body = request.body as {
            sync_enabled?: boolean;
            sync_roles?: boolean;
            sync_candidates?: boolean;
            sync_applications?: boolean;
            sync_interviews?: boolean;
        };

        try {
            const integration = await service.updateIntegration(id, body);
            return reply.send({ data: integration });
        } catch (err: any) {
            config.logger.error({ err, id }, 'Failed to update ATS integration');
            return reply.status(500).send({ error: err.message });
        }
    });

    // DELETE /api/v2/integrations/ats/:id — disconnect
    app.delete('/api/v2/integrations/ats/:id', async (request, reply) => {
        requireUserContext(request);
        const { id } = request.params as { id: string };

        try {
            await service.disconnectIntegration(id);
            return reply.status(204).send();
        } catch (err: any) {
            config.logger.error({ err, id }, 'Failed to disconnect ATS integration');
            return reply.status(500).send({ error: err.message });
        }
    });

    // POST /api/v2/integrations/ats/:id/sync — trigger sync
    app.post('/api/v2/integrations/ats/:id/sync', async (request, reply) => {
        requireUserContext(request);
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

    // GET /api/v2/integrations/ats/:id/sync-logs
    app.get('/api/v2/integrations/ats/:id/sync-logs', async (request, reply) => {
        requireUserContext(request);
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

    // GET /api/v2/integrations/ats/:id/stats
    app.get('/api/v2/integrations/ats/:id/stats', async (request, reply) => {
        requireUserContext(request);
        const { id } = request.params as { id: string };

        try {
            const stats = await service.getSyncStats(id);
            return reply.send({ data: stats });
        } catch (err: any) {
            config.logger.error({ err, id }, 'Failed to get sync stats');
            return reply.status(500).send({ error: err.message });
        }
    });

    // POST /api/v2/integrations/ats/:id/push-candidate — push candidate to ATS
    app.post('/api/v2/integrations/ats/:id/push-candidate', async (request, reply) => {
        requireUserContext(request);
        const { id } = request.params as { id: string };
        const body = request.body as {
            first_name: string;
            last_name: string;
            email: string;
            phone?: string;
            job_external_id?: string;
        };

        if (!body.first_name || !body.last_name || !body.email) {
            return reply.status(400).send({
                error: 'first_name, last_name, and email are required',
            });
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
