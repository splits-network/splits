import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ConsentServiceV2 } from './service';
import { requireUserContext } from '../shared/helpers';
import { SaveConsentRequest } from './types';

interface RegisterConsentRoutesConfig {
    consentService: ConsentServiceV2;
    logError: (message: string, error: unknown) => void;
}

export function registerConsentRoutes(
    app: FastifyInstance,
    config: RegisterConsentRoutesConfig
) {
    const { consentService, logError } = config;

    app.get('/api/v2/consent', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const consent = await consentService.getConsent(clerkUserId);
            if (!consent) {
                return reply.code(404).send({ error: { message: 'Consent not found' } });
            }
            return reply.send({ data: consent });
        } catch (error) {
            logError('GET /api/v2/consent failed', error);
            const status = (error as any)?.statusCode || 500;
            reply.code(status).send({ error: { message: (error as Error).message } });
        }
    });

    app.post('/api/v2/consent', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as SaveConsentRequest;
            if (!body?.preferences) {
                return reply
                    .code(400)
                    .send({ error: { message: 'preferences are required' } });
            }

            const consent = await consentService.saveConsent(clerkUserId, {
                preferences: {
                    functional: Boolean(body.preferences.functional),
                    analytics: Boolean(body.preferences.analytics),
                    marketing: Boolean(body.preferences.marketing),
                },
                ip_address: body.ip_address || request.ip,
                user_agent: body.user_agent || (request.headers['user-agent'] as string | undefined),
                consent_source: body.consent_source || 'web',
            });

            return reply.status(201).send({ data: consent });
        } catch (error) {
            logError('POST /api/v2/consent failed', error);
            const status = (error as any)?.statusCode || 500;
            reply.code(status).send({ error: { message: (error as Error).message } });
        }
    });

    app.delete('/api/v2/consent', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            await consentService.deleteConsent(clerkUserId);
            return reply.status(204).send();
        } catch (error) {
            logError('DELETE /api/v2/consent failed', error);
            const status = (error as any)?.statusCode || 500;
            reply.code(status).send({ error: { message: (error as Error).message } });
        }
    });
}
