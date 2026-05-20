/**
 * V3 Domain Event Consumer — AI Service
 *
 * Subscribes to domain events via RabbitMQ and routes them
 * to V3 AI services for processing.
 *
 * Events:
 * - application.stage_changed -> triggers AI review (ai_review / gpt_review stages)
 * - document.processed -> extracts structured resume metadata
 * - call.recording_ready -> triggers call AI pipeline (transcription + summarization)
 * - resume.analyze.requested -> GPT resume analysis (replaces HTTP call from gpt-service)
 */

import * as amqp from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import {
    DomainConsumerConfig,
    handleStageChanged,
    handleDocumentProcessed,
    handleDocumentEnriching,
    handleCallRecordingReady,
    handleResumeAnalyzeRequested,
} from './event-handlers.js';

const SUBSCRIBED_EVENTS = [
    'application.stage_changed',
    'document.processed',
    'document.enriching',
    'call.recording_ready',
    'resume.analyze.requested',
] as const;

export class DomainEventConsumer {
    private connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'ai-service-v3-queue';
    private logger: Logger;

    constructor(private config: DomainConsumerConfig) {
        this.logger = config.logger;
    }

    async connect(): Promise<void> {
        this.connection = await amqp.connect(this.config.rabbitMqUrl);
        if (!this.connection) throw new Error('Failed to establish RabbitMQ connection');

        this.channel = await this.connection.createChannel();
        if (!this.channel) throw new Error('Failed to create channel');

        await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
        await this.channel.assertQueue(this.queue, { durable: true });

        for (const event of SUBSCRIBED_EVENTS) {
            await this.channel.bindQueue(this.queue, this.exchange, event);
        }

        this.logger.info(
            { exchange: this.exchange, queue: this.queue, bindings: [...SUBSCRIBED_EVENTS] },
            'V3 AI domain consumer connected to RabbitMQ',
        );

        await this.channel.consume(this.queue, async (msg) => {
            if (!msg) return;
            try {
                const rawEvent = JSON.parse(msg.content.toString());
                const payload = rawEvent.payload ?? rawEvent;
                const event: DomainEvent = {
                    event_type: rawEvent.event_type ?? msg.fields.routingKey,
                    event_id: rawEvent.event_id ?? rawEvent.id ?? msg.properties.messageId ?? 'unknown',
                    timestamp: rawEvent.timestamp ?? new Date().toISOString(),
                    source_service: rawEvent.source_service ?? 'unknown',
                    payload,
                };

                this.logger.info(
                    { event_type: event.event_type, event_id: event.event_id },
                    'Processing AI event',
                );

                await this.handleEvent(event);
                this.channel!.ack(msg);
            } catch (error) {
                this.logger.error({ err: error }, 'Failed to process AI event');
                const retryCount = (msg.properties.headers?.['x-retry-count'] as number) ?? 0;
                const maxRetries = 5;
                if (retryCount >= maxRetries) {
                    this.logger.error(
                        { err: error, retry_count: retryCount, event_content: msg.content.toString() },
                        'Message permanently failed after max retries — discarding'
                    );
                    this.channel?.ack(msg);
                } else {
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // 1s, 2s, 4s, 8s, 16s → max 30s
                    this.logger.warn(
                        { err: error, retry_count: retryCount + 1, max_retries: maxRetries, delay_ms: delay },
                        'Event processing failed, scheduling retry'
                    );
                    setTimeout(() => {
                        if (!this.channel) return;
                        this.channel.sendToQueue(this.queue, msg.content, {
                            persistent: msg.properties.deliveryMode === 2,
                            headers: {
                                ...msg.properties.headers,
                                'x-retry-count': retryCount + 1,
                                'x-first-failed-at': msg.properties.headers?.['x-first-failed-at'] ?? new Date().toISOString(),
                                'x-last-error': (error as Error).message?.substring(0, 200),
                            }
                        });
                        this.channel.ack(msg);
                    }, delay);
                }
            }
        });

        this.logger.info('Started consuming domain events for V3 AI service');
    }

    private async handleEvent(event: DomainEvent): Promise<void> {
        switch (event.event_type) {
            case 'application.stage_changed':
                await handleStageChanged(event, this.config);
                break;
            case 'document.processed':
                await handleDocumentProcessed(event, this.config);
                break;
            case 'document.enriching':
                await handleDocumentEnriching(event, this.config);
                break;
            case 'call.recording_ready':
                await handleCallRecordingReady(event, this.config);
                break;
            case 'resume.analyze.requested':
                await handleResumeAnalyzeRequested(event, this.config);
                break;
            default:
                this.logger.debug({ event_type: event.event_type }, 'Unhandled event type');
        }
    }

    async close(): Promise<void> {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
            this.logger.info('Closed V3 AI domain consumer RabbitMQ connection');
        } catch (error) {
            this.logger.error({ err: error }, 'Error closing RabbitMQ connection');
        }
    }
}
