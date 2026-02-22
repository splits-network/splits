import { FastifyInstance } from 'fastify';
import { ConnectionRepository } from '../connections/repository';
import { TokenRefreshService } from '../calendar/token-refresh';
import { LinkedInService } from './service';
import { IEventPublisher } from '../shared/events';
import { requireUserContext } from '../shared/helpers';
import { Logger } from '@splits-network/shared-logging';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: IEventPublisher;
    logger: Logger;
}

export async function registerLinkedInRoutes(app: FastifyInstance, config: RegisterConfig) {
    const connectionRepo = new ConnectionRepository(config.supabaseUrl, config.supabaseKey);
    const tokenRefresh = new TokenRefreshService(connectionRepo, config.eventPublisher, config.logger);
    const service = new LinkedInService(connectionRepo, tokenRefresh, config.logger);

    // GET /api/v2/integrations/linkedin/:connectionId/profile
    app.get('/api/v2/integrations/linkedin/:connectionId/profile', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { connectionId } = request.params as { connectionId: string };

        try {
            const profile = await service.getProfile(connectionId, clerkUserId);
            return reply.send({ data: profile });
        } catch (err: any) {
            config.logger.error({ err, connectionId }, 'Failed to fetch LinkedIn profile');
            const status = err.message.includes('Unauthorized') ? 403
                : err.message.includes('not found') ? 404
                : err.message.includes('expired') ? 401
                : 500;
            return reply.status(status).send({ error: err.message });
        }
    });

    // GET /api/v2/integrations/linkedin/:connectionId/verification
    app.get('/api/v2/integrations/linkedin/:connectionId/verification', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { connectionId } = request.params as { connectionId: string };

        try {
            const status = await service.getVerificationStatus(connectionId, clerkUserId);
            return reply.send({ data: status });
        } catch (err: any) {
            config.logger.error({ err, connectionId }, 'Failed to check LinkedIn verification');
            const errStatus = err.message.includes('Unauthorized') ? 403
                : err.message.includes('not found') ? 404
                : err.message.includes('expired') ? 401
                : 500;
            return reply.status(errStatus).send({ error: err.message });
        }
    });

    // POST /api/v2/integrations/linkedin/:connectionId/refresh-profile
    app.post('/api/v2/integrations/linkedin/:connectionId/refresh-profile', async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { connectionId } = request.params as { connectionId: string };

        try {
            const profile = await service.getProfile(connectionId, clerkUserId);

            // Publish verification event
            try {
                await config.eventPublisher.publish('integration.linkedin_profile_verified', {
                    type: 'integration.linkedin_profile_verified',
                    connection_id: connectionId,
                    provider_slug: 'linkedin',
                    clerk_user_id: clerkUserId,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        linkedin_sub: profile.sub,
                        linkedin_name: profile.name,
                        linkedin_email: profile.email,
                        email_verified: profile.email_verified,
                    },
                });
            } catch (pubErr) {
                config.logger.error({ pubErr }, 'Failed to publish linkedin verification event');
            }

            return reply.send({ data: profile });
        } catch (err: any) {
            config.logger.error({ err, connectionId }, 'Failed to refresh LinkedIn profile');
            const status = err.message.includes('Unauthorized') ? 403
                : err.message.includes('not found') ? 404
                : err.message.includes('expired') ? 401
                : 500;
            return reply.status(status).send({ error: err.message });
        }
    });
}
