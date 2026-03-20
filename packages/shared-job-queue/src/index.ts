import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { randomUUID } from 'crypto';

export interface JobQueueConfig {
    rabbitMqUrl: string;
    queueName: string;
    logger?: Logger;
    maxRetries?: number;
    retryDelay?: number; // milliseconds
}

export interface JobData {
    [key: string]: any;
}

export interface JobMessage<T = JobData> {
    id: string;
    jobName: string;
    data: T;
    attempts: number;
    createdAt: Date;
    scheduledFor?: Date;
}

export interface JobResult {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
}

/**
 * Base Job Queue for async processing
 * Uses RabbitMQ for reliable job execution (consistent with our event-driven architecture)
 */
export class JobQueue<T extends JobData = JobData> {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-jobs';
    private readonly deadLetterExchange = 'splits-network-jobs-dlx';
    private logger: Logger;
    private isProcessing = false;

    constructor(private config: JobQueueConfig) {
        this.logger = config.logger || {
            info: (msg: string | object, message?: string) => {
                const logMsg = typeof msg === 'string' ? msg : (message || 'info');
                console.info(logMsg);
            },
            error: (msg: string | object, message?: string) => {
                const logMsg = typeof msg === 'string' ? msg : (message || 'error');
                console.error(logMsg);
            },
            warn: (msg: string | object, message?: string) => {
                const logMsg = typeof msg === 'string' ? msg : (message || 'warn');
                console.warn(logMsg);
            },
            debug: (msg: string | object, message?: string) => {
                const logMsg = typeof msg === 'string' ? msg : (message || 'debug');
                console.log(logMsg);
            }
        } as Logger;
    }

    /**
     * Connect to RabbitMQ and set up queues
     */
    async connect(): Promise<void> {
        try {
            this.connection = (await amqp.connect(this.config.rabbitMqUrl)) as any;
            this.channel = await (this.connection as any).createChannel();

            if (!this.channel) throw new Error('Failed to create channel');

            // Create exchanges
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            await this.channel.assertExchange(this.deadLetterExchange, 'topic', { durable: true });

            // Create main queue with DLX
            await this.channel.assertQueue(this.config.queueName, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': this.deadLetterExchange,
                    'x-dead-letter-routing-key': `${this.config.queueName}.failed`,
                },
            });

            // Create dead letter queue
            const dlqName = `${this.config.queueName}.dlq`;
            await this.channel.assertQueue(dlqName, { durable: true });

            // Bind queues
            await this.channel.bindQueue(this.config.queueName, this.exchange, this.config.queueName);
            await this.channel.bindQueue(dlqName, this.deadLetterExchange, `${this.config.queueName}.failed`);

            // Set prefetch for fair distribution
            await this.channel.prefetch(1);

            this.logger.info({ queueName: this.config.queueName }, 'Job queue connected');
        } catch (error) {
            this.logger.error({ error }, 'Failed to connect to job queue');
            throw error;
        }
    }

    /**
     * Add a job to the queue
     */
    async addJob(
        jobName: string,
        data: T,
        options?: {
            delay?: number; // milliseconds
            priority?: number;
        }
    ): Promise<string> {
        if (!this.channel) {
            throw new Error('Queue not connected');
        }

        const jobId = `${jobName}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const message: JobMessage<T> = {
            id: jobId,
            jobName,
            data,
            attempts: 0,
            createdAt: new Date(),
            scheduledFor: options?.delay ? new Date(Date.now() + options.delay) : undefined,
        };

        const messageBuffer = Buffer.from(JSON.stringify(message));

        // If delayed, use delayed message exchange pattern
        if (options?.delay) {
            // For RabbitMQ 3.6+, we can use delayed message plugin or TTL with DLX
            // Simple approach: use TTL to delay messages
            const delayQueue = `${this.config.queueName}.delay.${options.delay}`;
            await this.channel.assertQueue(delayQueue, {
                durable: true,
                arguments: {
                    'x-message-ttl': options.delay,
                    'x-dead-letter-exchange': this.exchange,
                    'x-dead-letter-routing-key': this.config.queueName,
                },
            });

            this.channel.sendToQueue(delayQueue, messageBuffer, {
                persistent: true,
                priority: options?.priority,
            });
        } else {
            this.channel.publish(this.exchange, this.config.queueName, messageBuffer, {
                persistent: true,
                priority: options?.priority,
            });
        }

        this.logger.info({ jobId, jobName, queueName: this.config.queueName }, 'Job added to queue');

        return jobId;
    }

    /**
     * Process jobs with a handler function
     */
    async startWorker(
        processor: (job: JobMessage<T>) => Promise<JobResult>,
        options?: {
            concurrency?: number;
        }
    ): Promise<void> {
        if (!this.channel) {
            throw new Error('Queue not connected');
        }

        if (this.isProcessing) {
            throw new Error('Worker already started');
        }

        this.isProcessing = true;
        const concurrency = options?.concurrency || 1;

        // Set prefetch based on concurrency
        await this.channel.prefetch(concurrency);

        await this.channel.consume(
            this.config.queueName,
            async (msg: ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const job: JobMessage<T> = JSON.parse(msg.content.toString());

                    this.logger.info(
                        { jobId: job.id, jobName: job.jobName, attempt: job.attempts + 1 },
                        'Processing job'
                    );

                    const result = await processor(job);

                    if (result.success) {
                        this.channel!.ack(msg);
                        this.logger.info({ jobId: job.id, jobName: job.jobName }, 'Job completed successfully');
                    } else {
                        // Retry logic
                        await this.handleJobFailure(msg, job, result.error);
                    }
                } catch (error) {
                    this.logger.error({ error }, 'Error processing job');
                    const job: JobMessage<T> = JSON.parse(msg.content.toString());
                    await this.handleJobFailure(msg, job, error instanceof Error ? error.message : 'Unknown error');
                }
            },
            { noAck: false }
        );

        this.logger.info(
            { queueName: this.config.queueName, concurrency },
            'Worker started'
        );
    }

    /**
     * Handle job failure with retry logic
     */
    private async handleJobFailure(
        msg: ConsumeMessage,
        job: JobMessage<T>,
        errorMessage?: string
    ): Promise<void> {
        const maxRetries = this.config.maxRetries || 3;
        const retryDelay = this.config.retryDelay || 5000;

        job.attempts += 1;

        if (job.attempts < maxRetries) {
            // Retry with exponential backoff
            const delay = retryDelay * Math.pow(2, job.attempts - 1);

            this.logger.warn(
                { jobId: job.id, attempt: job.attempts, maxRetries, delay },
                'Job failed, retrying'
            );

            // Reject and requeue with delay
            this.channel!.nack(msg, false, false);

            // Add back to queue with delay
            await this.addJob(job.jobName, job.data, { delay });
        } else {
            // Max retries exceeded, send to DLQ
            this.logger.error(
                { jobId: job.id, attempts: job.attempts, error: errorMessage },
                'Job failed after all retries'
            );

            this.channel!.nack(msg, false, false); // Will go to DLQ
        }
    }

    /**
     * Get failed jobs from DLQ
     */
    async getFailedJobs(limit: number = 100): Promise<JobMessage<T>[]> {
        if (!this.channel) {
            throw new Error('Queue not connected');
        }

        const dlqName = `${this.config.queueName}.dlq`;
        const failedJobs: JobMessage<T>[] = [];

        for (let i = 0; i < limit; i++) {
            const msg = await this.channel.get(dlqName, { noAck: false });
            if (!msg) break;

            const job: JobMessage<T> = JSON.parse(msg.content.toString());
            failedJobs.push(job);

            // Don't ack, just inspect
            this.channel.nack(msg, false, true);
        }

        return failedJobs;
    }

    /**
     * Retry a failed job
     */
    async retryFailedJob(jobId: string): Promise<void> {
        if (!this.channel) {
            throw new Error('Queue not connected');
        }

        const dlqName = `${this.config.queueName}.dlq`;

        // Get message from DLQ
        const msg = await this.channel.get(dlqName, { noAck: false });
        if (!msg) {
            throw new Error(`Job ${jobId} not found in DLQ`);
        }

        const job: JobMessage<T> = JSON.parse(msg.content.toString());

        if (job.id !== jobId) {
            // Not the right job, put it back
            this.channel.nack(msg, false, true);
            throw new Error(`Job ${jobId} not found in DLQ`);
        }

        // Reset attempts and requeue
        job.attempts = 0;
        await this.addJob(job.jobName, job.data);

        // Remove from DLQ
        this.channel.ack(msg);

        this.logger.info({ jobId }, 'Retrying failed job');
    }

    /**
     * Close connections
     */
    async close(): Promise<void> {
        this.isProcessing = false;

        if (this.channel) {
            await this.channel.close();
            this.channel = null;
        }
        if (this.connection) {
            // Connection will be closed when channel closes
            this.connection = null;
        }

        this.logger.info({ queueName: this.config.queueName }, 'Job queue closed');
    }
}

/**
 * Common interface for event publishers.
 * Both EventPublisher (direct RabbitMQ) and OutboxPublisher (DB-backed) implement this,
 * allowing services to swap implementations without changing repository/service code.
 */
export interface IEventPublisher {
    publish(eventType: string, payload: Record<string, any>, sourceService?: string): Promise<void>;
}

/**
 * Resilient EventPublisher for RabbitMQ domain events.
 * Shared implementation used by all services — handles connection drops,
 * channel closes, and transient errors with exponential-backoff reconnection.
 */
export class EventPublisher implements IEventPublisher {
    public connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 10;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isConnecting = false;
    private isClosing = false;
    private connectionHealthy = false;

    constructor(
        private rabbitMqUrl: string,
        private logger: Logger,
        private sourceService = 'unknown-service'
    ) { }

    async connect(): Promise<void> {
        if (this.isConnecting) {
            this.logger.debug('Event publisher connection attempt already in progress, skipping');
            return;
        }

        this.isConnecting = true;

        try {
            this.logger.info('Attempting to connect event publisher to RabbitMQ');

            this.connection = await amqp.connect(this.rabbitMqUrl, {
                heartbeat: 30,
            }) as any;
            if (!this.connection) throw new Error('Failed to establish RabbitMQ connection');

            this.connection.on('error', (err: Error) => {
                this.logger.error({ err }, 'RabbitMQ event publisher connection error');
                this.connectionHealthy = false;
                this.scheduleReconnect();
            });

            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ event publisher connection closed');
                this.connectionHealthy = false;
                if (!this.isClosing) this.scheduleReconnect();
            });

            this.channel = await (this.connection as any).createChannel();
            if (!this.channel) throw new Error('Failed to create channel');

            this.channel.on('error', (err: Error) => {
                this.logger.error({ err }, 'RabbitMQ event publisher channel error');
                this.connectionHealthy = false;
                if (!this.isClosing) this.scheduleReconnect();
            });

            this.channel.on('close', () => {
                this.logger.warn('RabbitMQ event publisher channel closed');
                this.connectionHealthy = false;
                if (!this.isClosing) this.scheduleReconnect();
            });

            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

            this.reconnectAttempts = 0;
            this.isConnecting = false;
            this.connectionHealthy = true;

            this.logger.info('Event publisher successfully connected to RabbitMQ');
        } catch (error) {
            this.isConnecting = false;
            this.connectionHealthy = false;
            this.logger.error({ err: error }, 'Failed to connect event publisher to RabbitMQ');

            if (!this.isClosing) {
                this.scheduleReconnect();
            } else {
                throw error;
            }
        }
    }

    private scheduleReconnect(): void {
        if (this.isClosing || this.reconnectTimeout) return;

        this.reconnectAttempts++;

        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            this.logger.error('Event publisher max reconnection attempts reached, giving up');
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);

        this.reconnectTimeout = setTimeout(async () => {
            this.reconnectTimeout = null;
            await this.cleanup();
            try {
                await this.connect();
            } catch (error) {
                this.logger.error({ err: error }, 'Event publisher reconnection attempt failed');
            }
        }, delay);
    }

    private async cleanup(): Promise<void> {
        this.connectionHealthy = false;
        try { if (this.channel) await this.channel.close(); } catch (_) { }
        try { if (this.connection) await (this.connection as any).close(); } catch (_) { }
        this.connection = null;
        this.channel = null;
    }

    isConnected(): boolean {
        return this.connection !== null && this.channel !== null && this.connectionHealthy;
    }

    /** Ensures the publisher is connected, reconnecting if necessary. Used by health checks. */
    async ensureConnection(): Promise<void> {
        if (!this.isConnected() && !this.isConnecting && !this.isClosing) {
            await this.connect();
        }
    }

    async publish(eventType: string, payload: Record<string, any>, sourceService?: string): Promise<void> {
        if (!this.isConnected()) {
            this.logger.error(
                { event_type: eventType },
                '❌ CRITICAL: RabbitMQ event publisher not connected - attempting reconnect'
            );
            if (!this.isConnecting && !this.isClosing) {
                try {
                    await this.connect();
                    if (this.isConnected()) {
                        await this.publish(eventType, payload, sourceService);
                        return;
                    }
                } catch (error) {
                    this.logger.error({ err: error }, 'Failed to reconnect for publish retry');
                }
            }
            throw new Error(`RabbitMQ not connected — cannot publish ${eventType}`);
        }

        const event: DomainEvent = {
            event_id: randomUUID(),
            event_type: eventType,
            timestamp: new Date().toISOString(),
            source_service: sourceService || this.sourceService,
            payload,
        };

        try {
            this.channel!.publish(
                this.exchange,
                eventType,
                Buffer.from(JSON.stringify(event)),
                { persistent: true }
            );
            this.logger.info({ event_type: eventType, event_id: event.event_id }, 'Event published');
        } catch (error) {
            this.logger.error({ err: error, event_type: eventType }, 'Failed to publish event');
            throw error;
        }
    }

    async close(): Promise<void> {
        this.isClosing = true;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        await this.cleanup();
        this.logger.info('Event publisher disconnected from RabbitMQ');
    }
}

/**
 * Durable event publisher that writes to the outbox_events table.
 * Use this instead of EventPublisher in repositories and services.
 *
 * Guarantees: if the DB write succeeds, the event will eventually be delivered
 * to RabbitMQ by OutboxWorker — even if RabbitMQ is temporarily down or
 * the process crashes before delivery.
 *
 * Integration:
 *   1. In service index.ts, create OutboxPublisher(supabaseClient, serviceName, logger)
 *   2. Create OutboxWorker(supabaseClient, eventPublisher, serviceName, logger) and call .start()
 *   3. Pass OutboxPublisher (typed as IEventPublisher) to repositories/services instead of EventPublisher
 */
export class OutboxPublisher implements IEventPublisher {
    constructor(
        private supabase: SupabaseClient,
        private sourceService: string,
        private logger: Logger,
    ) { }

    async publish(eventType: string, payload: Record<string, any>): Promise<void> {
        const { error } = await this.supabase
            .from('outbox_events')
            .insert({
                event_type: eventType,
                payload,
                source_service: this.sourceService,
                status: 'pending',
            });

        if (error) {
            this.logger.error(
                { err: error, event_type: eventType },
                'OutboxPublisher failed to write event to outbox'
            );
            throw new Error(`Failed to write event to outbox: ${error.message}`);
        }

        this.logger.debug({ event_type: eventType, source_service: this.sourceService }, 'Event queued in outbox');
    }
}

/**
 * Polls outbox_events for pending rows and delivers them to RabbitMQ.
 * Runs inside each service process — no separate deployment needed.
 *
 * Guarantees at-least-once delivery:
 *   - Events stay 'pending' until successfully published AND acknowledged in DB
 *   - If RabbitMQ is down, worker retries every pollIntervalMs
 *   - After maxAttempts failures, event is marked 'failed' for manual inspection
 *   - Concurrent service instances are safe: each only processes its own source_service
 *
 * Usage in service index.ts:
 *   const worker = new OutboxWorker(supabase, eventPublisher, serviceName, logger);
 *   worker.start();
 *   // On shutdown:
 *   worker.stop();
 */
export class OutboxWorker {
    private timer: NodeJS.Timeout | null = null;
    private processing = false;
    private readonly maxAttempts: number;
    private currentPollInterval: number;
    private consecutiveEmptyPolls = 0;
    private readonly maxPollInterval: number;
    private subscription: any = null;
    private fallbackTimer: NodeJS.Timeout | null = null;
    private useRealtime: boolean = true;

    constructor(
        private supabase: SupabaseClient,
        private eventPublisher: EventPublisher,
        private sourceService: string,
        private logger: Logger,
        private pollIntervalMs = 120000, // 2-minute fallback when realtime fails
        private batchSize = 50,
        maxAttempts = 5,
        useRealtime = true, // Enable realtime subscriptions by default
    ) {
        this.maxAttempts = maxAttempts;
        this.currentPollInterval = pollIntervalMs;
        this.maxPollInterval = Math.max(pollIntervalMs * 4, 300000); // Max 5 minutes
        this.useRealtime = useRealtime;
    }

    start(): void {
        if (this.timer || this.subscription) return;

        // Run immediately on start to flush any events that accumulated during downtime
        void this.poll();

        if (this.useRealtime) {
            this.setupRealTimeSubscription();
        } else {
            this.startFallbackPolling();
        }

        this.logger.info(
            {
                sourceService: this.sourceService,
                useRealtime: this.useRealtime,
                fallbackInterval: this.pollIntervalMs
            },
            'OutboxWorker started with real-time notifications + polling fallback'
        );
    }

    stop(): void {
        // Clean up real-time subscription
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }

        // Clean up polling timers
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        if (this.fallbackTimer) {
            clearTimeout(this.fallbackTimer);
            this.fallbackTimer = null;
        }

        this.logger.info({ sourceService: this.sourceService }, 'OutboxWorker stopped');
    }

    private formatSupabaseError(error: unknown): { message: string; isGatewayError: boolean } {
        const msg = error && typeof error === 'object' && 'message' in error ? String((error as any).message) : String(error);
        const details = error && typeof error === 'object' && 'details' in error ? String((error as any).details) : '';
        const fullMsg = details ? `${msg}\n${details}` : msg;

        const htmlMatch = fullMsg.match(/<title>\s*\|?\s*(\d{3}:\s*[^<]+)<\/title>/i);
        if (htmlMatch) {
            return { message: `Supabase gateway error: ${htmlMatch[1].trim()}`, isGatewayError: true };
        }
        if (fullMsg.includes('<!DOCTYPE') || fullMsg.includes('<html')) {
            return { message: 'Supabase returned an HTML error page (likely a gateway/proxy issue)', isGatewayError: true };
        }

        const transientPatterns = [
            'fetch failed',
            'UND_ERR_SOCKET',
            'other side closed',
            'ECONNRESET',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'socket hang up',
            'network error',
        ];
        const lowerFull = fullMsg.toLowerCase();
        if (transientPatterns.some(p => lowerFull.includes(p.toLowerCase()))) {
            return { message: `Supabase transient network error: ${msg}`, isGatewayError: true };
        }

        return { message: msg, isGatewayError: false };
    }

    private async poll(): Promise<void> {
        if (this.processing) return;
        this.processing = true;

        try {
            const { data: events, error } = await this.supabase
                .from('outbox_events')
                .select('id, event_type, payload, attempts')
                .eq('source_service', this.sourceService)
                .eq('status', 'pending')
                .order('created_at', { ascending: true })
                .limit(this.batchSize);

            if (error) {
                const formatted = this.formatSupabaseError(error);
                this.logger[formatted.isGatewayError ? 'warn' : 'error'](
                    { err: { message: formatted.message, code: (error as any).code } },
                    formatted.isGatewayError
                        ? 'OutboxWorker: Supabase temporarily unavailable, will retry next poll'
                        : 'OutboxWorker failed to fetch pending events'
                );
                return;
            }

            if (!events || events.length === 0) {
                // Increase backoff when no events found
                this.consecutiveEmptyPolls++;
                if (this.consecutiveEmptyPolls <= 3) {
                    const prevInterval = this.currentPollInterval;
                    this.currentPollInterval = Math.min(
                        this.currentPollInterval * 1.5,
                        this.maxPollInterval
                    );
                    if (this.currentPollInterval !== prevInterval) {
                        this.logger.debug(
                            {
                                sourceService: this.sourceService,
                                consecutiveEmptyPolls: this.consecutiveEmptyPolls,
                                prevInterval: prevInterval,
                                newInterval: this.currentPollInterval
                            },
                            'OutboxWorker: No events found, increasing poll interval'
                        );
                    }
                }
                return;
            }

            // Reset backoff when events found
            if (this.consecutiveEmptyPolls > 0) {
                this.logger.debug(
                    {
                        sourceService: this.sourceService,
                        consecutiveEmptyPolls: this.consecutiveEmptyPolls,
                        resettingInterval: this.pollIntervalMs
                    },
                    'OutboxWorker: Events found, resetting poll interval'
                );
                this.consecutiveEmptyPolls = 0;
                this.currentPollInterval = this.pollIntervalMs;
            }

            this.logger.info(
                { count: events.length, sourceService: this.sourceService },
                'OutboxWorker delivering pending events'
            );

            for (const event of events) {
                await this.deliver(event);
            }
        } finally {
            this.processing = false;
            // Schedule next poll with current interval (may be backed off)
            this.scheduleNextPoll();
        }
    }

    private scheduleNextPoll(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => void this.poll(), this.currentPollInterval);
    }

    private async deliver(event: { id: string; event_type: string; payload: Record<string, any>; attempts: number }): Promise<void> {
        try {
            await this.eventPublisher.publish(event.event_type, event.payload, this.sourceService);

            const { error } = await this.supabase
                .from('outbox_events')
                .update({ status: 'published', published_at: new Date().toISOString() })
                .eq('id', event.id);

            if (error) {
                // RabbitMQ publish succeeded but we couldn't mark it — log and move on.
                // Event will be delivered again on next poll (duplicate delivery is acceptable).
                const formatted = this.formatSupabaseError(error);
                this.logger[formatted.isGatewayError ? 'warn' : 'error'](
                    { err: { message: formatted.message, code: (error as any).code }, event_id: event.id },
                    formatted.isGatewayError
                        ? 'OutboxWorker: Supabase unavailable after publish — event will re-deliver'
                        : 'OutboxWorker delivered event but failed to mark as published (will re-deliver)'
                );
            } else {
                this.logger.debug({ event_id: event.id, event_type: event.event_type }, 'OutboxWorker delivered event');
            }
        } catch (err) {
            const attempts = (event.attempts ?? 0) + 1;
            const exhausted = attempts >= this.maxAttempts;
            const formatted = this.formatSupabaseError(err);

            await this.supabase
                .from('outbox_events')
                .update({
                    status: exhausted ? 'failed' : 'pending',
                    attempts,
                    error: formatted.message,
                    error_at: new Date().toISOString(),
                })
                .eq('id', event.id);

            this.logger.error(
                { err: { message: formatted.message }, event_id: event.id, event_type: event.event_type, attempts, exhausted },
                exhausted
                    ? 'OutboxWorker exhausted retries — event marked failed'
                    : 'OutboxWorker failed to deliver event, will retry'
            );
        }
    }

    /**
     * Set up real-time subscription to outbox_events table
     * Listens for INSERT events for this service's events only
     */
    private setupRealTimeSubscription(): void {
        try {
            const channelName = `outbox_worker_${this.sourceService}_${Date.now()}`;

            this.subscription = this.supabase
                .channel(channelName)
                .on('postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'outbox_events',
                        filter: `source_service=eq.${this.sourceService}`
                    },
                    (payload) => {
                        this.logger.debug(
                            { sourceService: this.sourceService, eventId: payload.new?.id },
                            'OutboxWorker: Real-time event received, processing immediately'
                        );
                        // Process immediately when new event is inserted
                        void this.poll();
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        this.logger.info(
                            { sourceService: this.sourceService, channel: channelName },
                            'OutboxWorker: Real-time subscription active'
                        );
                        // Start fallback polling at longer intervals as backup
                        this.startFallbackPolling();
                    } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                        this.logger.warn(
                            { sourceService: this.sourceService, status, channel: channelName },
                            'OutboxWorker: Real-time subscription failed, using polling only'
                        );
                        // If subscription fails, just use regular polling
                        if (!this.fallbackTimer) {
                            this.startFallbackPolling();
                        }
                    }
                });

        } catch (error) {
            this.logger.error(
                { sourceService: this.sourceService, error: error instanceof Error ? error.message : String(error) },
                'OutboxWorker: Failed to setup real-time subscription, falling back to polling'
            );
            this.startFallbackPolling();
        }
    }

    /**
     * Start fallback polling at longer intervals (as backup to real-time)
     */
    private startFallbackPolling(): void {
        if (this.fallbackTimer) return;

        // Use longer intervals since this is just a fallback
        const fallbackInterval = Math.max(this.pollIntervalMs, 120000); // At least 2 minutes

        this.fallbackTimer = setInterval(() => {
            void this.poll();
        }, fallbackInterval);

        this.logger.debug(
            { sourceService: this.sourceService, interval: fallbackInterval },
            'OutboxWorker: Fallback polling started'
        );
    }
}
