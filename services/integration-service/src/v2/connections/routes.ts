import { FastifyInstance } from 'fastify';
import { ConnectionRepository } from './repository';
import { ConnectionService } from './service';
import { ProviderRepository } from '../providers/repository';
import { IEventPublisher } from '../shared/events';
import { requireUserContext } from '../shared/helpers';
import { Logger } from '@splits-network/shared-logging';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: IEventPublisher;
    logger: Logger;
}

export async function registerConnectionRoutes(app: FastifyInstance, config: RegisterConfig) {
    const connectionRepo = new ConnectionRepository(config.supabaseUrl, config.supabaseKey);
    const providerRepo = new ProviderRepository(config.supabaseUrl, config.supabaseKey);
    const service = new ConnectionService(connectionRepo, providerRepo, config.eventPublisher, config.logger);

    // GET /api/v2/integrations/connections — list user's connections
    app.get('/api/v2/integrations/connections', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const connections = await service.listConnections(clerkUserId);
        return reply.send({ data: connections });
    });

    // POST /api/v2/integrations/connections/initiate — start OAuth flow
    app.post('/api/v2/integrations/connections/initiate', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const body = request.body as {
            provider_slug: string;
            redirect_uri: string;
            organization_id?: string;
        };

        if (!body.provider_slug || !body.redirect_uri) {
            return reply.status(400).send({ error: 'provider_slug and redirect_uri are required' });
        }

        try {
            const result = await service.initiateOAuth(
                clerkUserId,
                body.provider_slug,
                body.redirect_uri,
                body.organization_id,
            );
            return reply.send({ data: result });
        } catch (err: any) {
            return reply.status(400).send({ error: err.message });
        }
    });

    // POST /api/v2/integrations/connections/callback — handle OAuth callback
    app.post('/api/v2/integrations/connections/callback', async (request, reply) => {
        const body = request.body as { code: string; state: string };

        if (!body.code || !body.state) {
            return reply.status(400).send({ error: 'code and state are required' });
        }

        try {
            const connection = await service.handleCallback(body.code, body.state);
            return reply.send({ data: connection });
        } catch (err: any) {
            return reply.status(400).send({ error: err.message });
        }
    });

    // DELETE /api/v2/integrations/connections/:id — disconnect
    app.delete('/api/v2/integrations/connections/:id', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };

        try {
            await service.disconnect(id, clerkUserId);
            return reply.send({ data: { success: true } });
        } catch (err: any) {
            return reply.status(400).send({ error: err.message });
        }
    });
}
