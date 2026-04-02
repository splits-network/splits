import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { EntitlementChecker } from '@splits-network/shared-access-context';
import { ConnectionRepository } from './repository.js';
import { ConnectionService } from './service.js';
import { ProviderRepository } from '../providers/repository.js';
import { IEventPublisher } from '../shared/events.js';
import { requireUserContext } from '../shared/helpers.js';
import { Logger } from '@splits-network/shared-logging';
import { CryptoService } from '@splits-network/shared-config/src/crypto';

const EMAIL_PROVIDER_SLUGS = ['google_email', 'microsoft_email'];
const CALENDAR_PROVIDER_SLUGS = ['google_calendar', 'microsoft_calendar'];

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: IEventPublisher;
    logger: Logger;
    crypto: CryptoService;
}

export async function registerConnectionRoutes(app: FastifyInstance, config: RegisterConfig) {
    const connectionRepo = new ConnectionRepository(config.supabaseUrl, config.supabaseKey);
    const providerRepo = new ProviderRepository(config.supabaseUrl, config.supabaseKey);
    const service = new ConnectionService(connectionRepo, providerRepo, config.eventPublisher, config.logger, config.crypto);
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);
    const entitlementChecker = new EntitlementChecker(supabase);

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

        // Entitlement gate: check email or calendar integration access
        const isEmail = EMAIL_PROVIDER_SLUGS.includes(body.provider_slug);
        const isCalendar = CALENDAR_PROVIDER_SLUGS.includes(body.provider_slug);
        const requiredEntitlement = isEmail ? 'email_integration' : isCalendar ? 'calendar_integration' : null;

        if (requiredEntitlement) {
            const entitled = await entitlementChecker.hasEntitlementByClerkId(
                clerkUserId,
                requiredEntitlement as 'email_integration' | 'calendar_integration',
            );
            if (!entitled) {
                return reply.status(403).send({
                    error: 'Upgrade required',
                    requiredTier: 'pro',
                    entitlement: requiredEntitlement,
                });
            }
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
