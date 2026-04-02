/**
 * Domain Event Consumer - V2
 * Listens for domain events and triggers automation rule evaluation
 */

import * as amqp from 'amqplib';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { AutomationRuleRepository } from '../rules/repository.js';
import { AutomationExecutionRepository } from '../executions/repository.js';
import { AutomationExecutionServiceV2 } from '../executions/service.js';
import { evaluateConditions, TriggerConditions } from '../executions/rule-engine.js';
import { FraudSignalRepository } from '../fraud-signals/repository.js';
import { runFraudAnalysis } from '../fraud-signals/analyzers/index.js';
import { IEventPublisher } from './events.js';
import type { AccessContext } from './access.js';

interface DomainConsumerConfig {
    rabbitMqUrl: string;
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
    resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>;
    logger: Logger;
}

export class DomainEventConsumer {
    private connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'automation-service-v2-queue';
    private supabase: SupabaseClient;
    private ruleRepository: AutomationRuleRepository;
    private fraudRepository: FraudSignalRepository;
    private executionService: AutomationExecutionServiceV2;
    private logger: Logger;

    constructor(private config: DomainConsumerConfig) {
        this.logger = config.logger;
        this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
        this.ruleRepository = new AutomationRuleRepository(
            config.supabaseUrl,
            config.supabaseKey,
        );
        this.fraudRepository = new FraudSignalRepository(
            config.supabaseUrl,
            config.supabaseKey,
        );
        const executionRepository = new AutomationExecutionRepository(
            config.supabaseUrl,
            config.supabaseKey,
        );
        this.executionService = new AutomationExecutionServiceV2(
            executionRepository,
            config.resolveAccessContext,
            config.eventPublisher,
            config.logger,
        );
    }

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.config.rabbitMqUrl);
            if (!this.connection) {
                throw new Error('Failed to establish RabbitMQ connection');
            }

            this.channel = await this.connection.createChannel();
            if (!this.channel) throw new Error('Failed to create channel');

            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            await this.channel.assertQueue(this.queue, { durable: true });

            // Bind to events that can trigger automation rules
            await this.channel.bindQueue(this.queue, this.exchange, 'application.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.stage_changed');
            await this.channel.bindQueue(this.queue, this.exchange, 'application.expired');
            await this.channel.bindQueue(this.queue, this.exchange, 'placement.created');
            await this.channel.bindQueue(this.queue, this.exchange, 'placement.status_changed');

            this.logger.info('V2 domain consumer connected to RabbitMQ');

            await this.channel.consume(this.queue, async (msg) => {
                if (msg) {
                    try {
                        const event: DomainEvent = JSON.parse(msg.content.toString());
                        await this.handleEvent(event);
                        this.channel!.ack(msg);
                    } catch (error) {
                        this.logger.error({ err: error }, 'Failed to process event');
                        this.channel!.nack(msg, false, false);
                    }
                }
            });

            this.logger.info('Started consuming domain events for rule evaluation');
        } catch (error) {
            this.logger.error({ err: error }, 'Failed to connect to RabbitMQ');
            throw error;
        }
    }

    private async handleEvent(event: DomainEvent): Promise<void> {
        this.logger.info(
            { event_type: event.event_type, event_id: event.event_id },
            'Processing automation event',
        );

        await Promise.all([
            this.evaluateRulesForEvent(event),
            this.runFraudDetection(event),
        ]);
    }

    /**
     * Run fraud detection analyzers and persist any detected signals.
     */
    private async runFraudDetection(event: DomainEvent): Promise<void> {
        try {
            const signals = await runFraudAnalysis(
                this.supabase,
                event.event_type,
                (event.payload as Record<string, any>) || {},
            );

            for (const signal of signals) {
                try {
                    const created = await this.fraudRepository.createSignal(signal);
                    this.logger.info(
                        { signalId: created.id, signalType: signal.signal_type, severity: signal.severity },
                        'Fraud signal detected and created',
                    );

                    if (this.config.eventPublisher) {
                        await this.config.eventPublisher.publish('fraud_signal.created', {
                            fraud_signal_id: created.id,
                            signal_type: created.signal_type,
                            severity: created.severity,
                            confidence_score: created.confidence_score,
                        });
                    }
                } catch (err) {
                    this.logger.error(
                        { err, signalType: signal.signal_type },
                        'Failed to create fraud signal',
                    );
                }
            }
        } catch (err) {
            this.logger.error({ err, eventType: event.event_type }, 'Failed to run fraud detection');
        }
    }

    /**
     * Find active rules that match this event and create executions for them.
     */
    private async evaluateRulesForEvent(event: DomainEvent): Promise<void> {
        try {
            const { data: rules } = await this.ruleRepository.findRules({
                status: 'active',
                limit: 100,
            });

            if (!rules || rules.length === 0) return;

            for (const rule of rules) {
                try {
                    const conditions = rule.trigger_conditions as TriggerConditions;
                    const matches = evaluateConditions(
                        conditions,
                        event.event_type,
                        event.payload || {},
                    );

                    if (!matches) continue;

                    this.logger.info(
                        { ruleId: rule.id, ruleName: rule.name, eventType: event.event_type },
                        'Rule conditions matched, creating execution',
                    );

                    const { entityType, entityId } = this.extractEntity(event);

                    await this.executionService.createExecution({
                        rule_id: rule.id,
                        entity_type: entityType,
                        entity_id: entityId,
                        trigger_event_type: event.event_type,
                        requires_approval: rule.requires_human_approval,
                        trigger_data: {
                            event_type: event.event_type,
                            event_payload: event.payload,
                            actions: rule.actions,
                        },
                    });
                } catch (err) {
                    this.logger.error(
                        { err, ruleId: rule.id, eventType: event.event_type },
                        'Failed to evaluate rule for event',
                    );
                }
            }
        } catch (err) {
            this.logger.error({ err, eventType: event.event_type }, 'Failed to evaluate rules');
        }
    }

    private extractEntity(event: DomainEvent): { entityType: string; entityId: string } {
        const payload = event.payload as Record<string, any> || {};

        if (payload.application_id) {
            return { entityType: 'application', entityId: payload.application_id };
        }
        if (payload.placement_id) {
            return { entityType: 'placement', entityId: payload.placement_id };
        }
        if (payload.candidate_id) {
            return { entityType: 'candidate', entityId: payload.candidate_id };
        }
        if (payload.recruiter_id) {
            return { entityType: 'recruiter', entityId: payload.recruiter_id };
        }

        return { entityType: event.event_type.split('.')[0], entityId: 'unknown' };
    }

    async close(): Promise<void> {
        try {
            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
            this.logger.info('Closed RabbitMQ connection');
        } catch (error) {
            this.logger.error({ err: error }, 'Error closing RabbitMQ connection');
        }
    }
}
