/**
 * Audit Event Consumer for GPT Service
 * Listens to gpt.oauth.* and gpt.action.* RabbitMQ events
 * and writes them to the gpt_oauth_events database table.
 */

import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';

interface DomainEvent {
    event_id: string;
    event_type: string;
    payload: Record<string, any>;
    timestamp: string;
    source_service: string;
}

export class AuditEventConsumer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private supabase: SupabaseClient;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'gpt-service-audit-events';

    constructor(
        private rabbitMqUrl: string,
        supabaseUrl: string,
        supabaseKey: string,
        private logger: Logger
    ) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Connect to RabbitMQ and start consuming events
     */
    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.rabbitMqUrl) as any;
            this.channel = await (this.connection as any).createChannel();

            if (!this.channel) {
                throw new Error('Failed to create RabbitMQ channel');
            }

            // Declare topic exchange
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

            // Declare durable queue
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to gpt.oauth.* events (authorize, token_exchange, token_refresh, revoke, etc.)
            await this.channel.bindQueue(this.queue, this.exchange, 'gpt.oauth.#');

            // Bind to gpt.action.* events for future action audit (job_search, resume_analyze, etc.)
            await this.channel.bindQueue(this.queue, this.exchange, 'gpt.action.#');

            this.logger.info('GPT audit consumer connected to RabbitMQ');

            // Start consuming with manual acknowledgment for reliability
            await this.channel.consume(
                this.queue,
                (msg) => this.handleMessage(msg),
                { noAck: false }
            );

            this.logger.info('GPT audit consumer started consuming events');
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to connect GPT audit consumer to RabbitMQ');
            throw error;
        }
    }

    /**
     * Handle incoming message - parse event and write to gpt_oauth_events table
     */
    private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
        if (!msg || !this.channel) {
            return;
        }

        try {
            const event: DomainEvent = JSON.parse(msg.content.toString());

            this.logger.debug(
                {
                    event_id: event.event_id,
                    event_type: event.event_type,
                },
                'GPT audit consumer received event'
            );

            // Insert into gpt_oauth_events table
            const { error } = await this.supabase
                .from('gpt_oauth_events')
                .insert({
                    event_type: event.event_type,
                    clerk_user_id: event.payload.clerk_user_id ?? null,
                    metadata: event.payload,
                    ip_address: event.payload.ip_address ?? null,
                });

            if (error) {
                this.logger.error(
                    {
                        err: error,
                        event_id: event.event_id,
                        event_type: event.event_type,
                    },
                    'Failed to write audit event to database'
                );
                // Nack without requeue to avoid infinite loop on persistent DB errors
                this.channel.nack(msg, false, false);
                return;
            }

            this.logger.debug(
                {
                    event_id: event.event_id,
                    event_type: event.event_type,
                },
                'Audit event written to gpt_oauth_events'
            );

            // Acknowledge successful processing
            this.channel.ack(msg);
        } catch (error) {
            this.logger.error(
                { err: error },
                'Error processing audit event message'
            );
            // Nack without requeue for malformed messages
            this.channel?.nack(msg, false, false);
        }
    }

    /**
     * Disconnect from RabbitMQ
     */
    async disconnect(): Promise<void> {
        try {
            await this.channel?.close();
            await (this.connection as any)?.close();
            this.logger.info('GPT audit consumer disconnected from RabbitMQ');
        } catch (error) {
            this.logger.error({ err: error }, 'Error disconnecting GPT audit consumer');
        }
    }
}
