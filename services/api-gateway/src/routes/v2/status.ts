import { FastifyInstance } from 'fastify';
import { EventPublisher } from '../../events/event-publisher';

interface StatusContactRequest {
    name?: string;
    email?: string;
    topic?: string;
    urgency?: string;
    message?: string;
    source?: string;
    submitted_at?: string;
    ip_address?: string;
    user_agent?: string;
}

const sanitize = (value?: string) => (typeof value === 'string' ? value.trim() : '');

export function registerStatusRoutes(app: FastifyInstance, eventPublisher: EventPublisher | null) {
    app.post(
        '/api/v2/status-contact',
        {
            schema: {
                summary: 'Submit status page contact form',
                tags: ['status'],
                body: {
                    type: 'object',
                    required: ['name', 'email', 'message', 'source', 'submitted_at'],
                    properties: {
                        name: { type: 'string' },
                        email: { type: 'string' },
                        topic: { type: 'string' },
                        urgency: { type: 'string' },
                        message: { type: 'string' },
                        source: { type: 'string' },
                        submitted_at: { type: 'string' },
                        ip_address: { type: 'string' },
                        user_agent: { type: 'string' },
                    },
                },
                response: {
                    202: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    503: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const body = request.body as StatusContactRequest;

            const name = sanitize(body.name);
            const email = sanitize(body.email).toLowerCase();
            const topic = sanitize(body.topic) || 'general';
            const urgency = sanitize(body.urgency || 'normal');
            const message = sanitize(body.message);
            const source = sanitize(body.source) || 'status-page';
            const submittedAt = sanitize(body.submitted_at);

            if (!name || !email || !message || !submittedAt) {
                return reply.status(400).send({ error: 'Missing required fields.' });
            }

            if (!email.includes('@')) {
                return reply.status(400).send({ error: 'Invalid email address.' });
            }

            if (message.length < 10) {
                return reply.status(400).send({ error: 'Message must be at least 10 characters long.' });
            }

            if (!eventPublisher || !eventPublisher.isConnected()) {
                request.log.error('Event publisher unavailable for status contact submission');
                return reply.status(503).send({ error: 'Support form temporarily unavailable.' });
            }

            await eventPublisher.publish('status.contact_submitted', {
                name,
                email,
                topic,
                urgency,
                message,
                source,
                submitted_at: submittedAt,
                ip_address: sanitize(body.ip_address),
                user_agent: sanitize(body.user_agent),
            });

            return reply.status(202).send({ success: true });
        }
    );
}
