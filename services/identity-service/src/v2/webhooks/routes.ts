/**
 * V2 Webhooks Routes - Identity Service
 * HTTP endpoints for webhook handling
 */

import { FastifyInstance, FastifyRequest } from 'fastify';
import { Webhook } from 'svix';
import { createLogger } from '@splits-network/shared-logging';
import type { Logger } from '@splits-network/shared-logging';
import { WebhooksServiceV2 } from './service';
import { ClerkWebhookEvent, WebhookHeaders } from './types';

// Webhook secrets for each Clerk instance (portal + candidate app)
const SPLITS_WEBHOOK_SECRET = process.env.SPLITS_CLERK_WEBHOOK_SECRET;
const APP_WEBHOOK_SECRET = process.env.APP_CLERK_WEBHOOK_SECRET;
// Fallback to legacy single-secret env var for backwards compatibility
const LEGACY_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

const logger = createLogger({
    serviceName: 'identity-service',
    level: 'info'
});

export async function webhooksRoutesV2(
    app: FastifyInstance,
    service: WebhooksServiceV2
) {
    /**
     * Handle Clerk user lifecycle webhooks
     * POST /v2/webhooks/clerk
     */
    app.post('/api/v2/webhooks/clerk', {
        schema: {
            description: 'Handle Clerk user lifecycle webhook events',
            tags: ['webhooks'],
            headers: {
                type: 'object',
                properties: {
                    'svix-id': { type: 'string' },
                    'svix-timestamp': { type: 'string' },
                    'svix-signature': { type: 'string' }
                },
                required: ['svix-id', 'svix-timestamp', 'svix-signature']
            },
            body: {
                type: 'object'
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' }
                            }
                        }
                    }
                },
                400: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string' },
                                message: { type: 'string' }
                            }
                        }
                    }
                },
                500: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'object',
                            properties: {
                                code: { type: 'string' },
                                message: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Headers: WebhookHeaders; Body: any }>, reply) => {
        // Collect all available webhook secrets to try
        const secrets = [
            SPLITS_WEBHOOK_SECRET,
            APP_WEBHOOK_SECRET,
            LEGACY_WEBHOOK_SECRET,
        ].filter(Boolean) as string[];

        if (secrets.length === 0) {
            logger.error('No Clerk webhook secrets configured (need SPLITS_CLERK_WEBHOOK_SECRET or APP_CLERK_WEBHOOK_SECRET)');
            return reply.code(500).send({
                error: {
                    code: 'WEBHOOK_SECRET_MISSING',
                    message: 'Webhook secret not configured'
                }
            });
        }

        try {
            const headers = {
                'svix-id': request.headers['svix-id'],
                'svix-timestamp': request.headers['svix-timestamp'],
                'svix-signature': request.headers['svix-signature']
            };
            const payload = JSON.stringify(request.body);

            // Try each secret until one verifies successfully
            // (webhook could come from either the portal or candidate Clerk instance)
            let event: ClerkWebhookEvent | null = null;
            for (const secret of secrets) {
                try {
                    const wh = new Webhook(secret);
                    event = wh.verify(payload, headers) as ClerkWebhookEvent;
                    break; // Verification succeeded
                } catch {
                    // This secret didn't match, try the next one
                }
            }

            if (!event) {
                throw new Error('Invalid signature: no configured secret could verify this webhook');
            }

            logger.info({
                type: event.type,
                id: event.data.id
            }, 'Received Clerk webhook');

            // Process the webhook event
            await service.handleClerkWebhook(event);

            return reply.send({
                data: {
                    message: 'Webhook processed successfully'
                }
            });

        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid signature')) {
                logger.error({
                    headers: request.headers,
                    error: error.message
                }, 'Invalid webhook signature');

                return reply.code(400).send({
                    error: {
                        code: 'INVALID_SIGNATURE',
                        message: 'Invalid webhook signature'
                    }
                });
            }

            logger.error({
                error: error instanceof Error ? error.message : 'Unknown error',
                body: request.body
            }, 'Failed to process webhook');

            return reply.code(500).send({
                error: {
                    code: 'WEBHOOK_PROCESSING_ERROR',
                    message: 'Failed to process webhook'
                }
            });
        }
    });

    /**
     * Health check endpoint for webhook monitoring
     * GET /v2/webhooks/health
     */
    app.get('/api/v2/webhooks/health', {
        schema: {
            description: 'Webhook service health check',
            tags: ['webhooks'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                status: { type: 'string' },
                                timestamp: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        return reply.send({
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString()
            }
        });
    });
}
