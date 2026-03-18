import { SupabaseClient } from '@supabase/supabase-js';
import { EventPublisher } from '@splits-network/shared-job-queue';
import { Logger } from '@splits-network/shared-logging';

/**
 * Centralized OutboxWorker that drains ALL services' outbox_events.
 *
 * Unlike the per-service OutboxWorker in shared-job-queue (which filters by
 * source_service), this worker processes every pending event regardless of
 * source.  Only ONE instance of this service should run in the cluster.
 *
 * Delivery guarantees:
 *   - At-least-once: events stay 'pending' until published AND marked in DB
 *   - Batched: fetches up to `batchSize` events per poll
 *   - Adaptive backoff: polls less frequently when idle, resets on activity
 *   - Realtime-first: listens for INSERT via Supabase realtime, falls back to polling
 */
export class CentralOutboxWorker {
    private processing = false;
    private timer: NodeJS.Timeout | null = null;
    private fallbackTimer: NodeJS.Timeout | null = null;
    private subscription: any = null;
    private currentPollInterval: number;
    private consecutiveEmptyPolls = 0;
    private readonly maxPollInterval: number;
    private stopped = false;

    /** Running stats for health/metrics */
    private stats = {
        deliveredTotal: 0,
        failedTotal: 0,
        lastPollAt: null as Date | null,
        lastDeliveryAt: null as Date | null,
    };

    constructor(
        private supabase: SupabaseClient,
        private eventPublisher: EventPublisher,
        private logger: Logger,
        private pollIntervalMs = 10_000,  // 10s base — single service so we can afford faster polls
        private batchSize = 100,
        private maxAttempts = 5,
    ) {
        this.currentPollInterval = pollIntervalMs;
        this.maxPollInterval = Math.max(pollIntervalMs * 6, 60_000); // Max 1 minute
    }

    start(): void {
        if (this.timer || this.subscription) return;
        this.stopped = false;

        // Flush any events that accumulated during downtime
        void this.poll();

        this.setupRealtimeSubscription();

        this.logger.info(
            { pollInterval: this.pollIntervalMs, batchSize: this.batchSize, maxAttempts: this.maxAttempts },
            'CentralOutboxWorker started — processing all services',
        );
    }

    stop(): void {
        this.stopped = true;

        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.fallbackTimer) {
            clearInterval(this.fallbackTimer);
            this.fallbackTimer = null;
        }

        this.logger.info('CentralOutboxWorker stopped');
    }

    getStats() {
        return { ...this.stats };
    }

    // ── Polling ─────────────────────────────────────────────────────────

    private async poll(): Promise<void> {
        if (this.processing || this.stopped) return;
        this.processing = true;
        this.stats.lastPollAt = new Date();

        try {
            const { data: events, error } = await this.supabase
                .from('outbox_events')
                .select('id, event_type, payload, attempts, source_service')
                .eq('status', 'pending')
                .order('created_at', { ascending: true })
                .limit(this.batchSize);

            if (error) {
                const msg = this.formatError(error);
                this.logger.warn({ err: msg }, 'CentralOutboxWorker: failed to fetch pending events');
                return;
            }

            if (!events || events.length === 0) {
                this.consecutiveEmptyPolls++;
                if (this.consecutiveEmptyPolls <= 3) {
                    this.currentPollInterval = Math.min(
                        this.currentPollInterval * 1.5,
                        this.maxPollInterval,
                    );
                }
                return;
            }

            // Reset backoff
            if (this.consecutiveEmptyPolls > 0) {
                this.consecutiveEmptyPolls = 0;
                this.currentPollInterval = this.pollIntervalMs;
            }

            this.logger.info(
                { count: events.length },
                'CentralOutboxWorker delivering pending events',
            );

            for (const event of events) {
                await this.deliver(event);
            }
        } finally {
            this.processing = false;
            this.scheduleNextPoll();
        }
    }

    private scheduleNextPoll(): void {
        if (this.stopped) return;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => void this.poll(), this.currentPollInterval);
    }

    // ── Delivery ────────────────────────────────────────────────────────

    private async deliver(event: {
        id: string;
        event_type: string;
        payload: Record<string, any>;
        attempts: number;
        source_service: string;
    }): Promise<void> {
        try {
            await this.eventPublisher.publish(event.event_type, event.payload, event.source_service);

            const { error } = await this.supabase
                .from('outbox_events')
                .update({ status: 'published', published_at: new Date().toISOString() })
                .eq('id', event.id);

            if (error) {
                this.logger.warn(
                    { err: this.formatError(error), event_id: event.id },
                    'CentralOutboxWorker: delivered but failed to mark published (will re-deliver)',
                );
            } else {
                this.stats.deliveredTotal++;
                this.stats.lastDeliveryAt = new Date();
                this.logger.debug(
                    { event_id: event.id, event_type: event.event_type, source: event.source_service },
                    'Event delivered',
                );
            }
        } catch (err) {
            const attempts = (event.attempts ?? 0) + 1;
            const exhausted = attempts >= this.maxAttempts;

            await this.supabase
                .from('outbox_events')
                .update({
                    status: exhausted ? 'failed' : 'pending',
                    attempts,
                    error: err instanceof Error ? err.message : String(err),
                    error_at: new Date().toISOString(),
                })
                .eq('id', event.id);

            if (exhausted) this.stats.failedTotal++;

            this.logger.error(
                { event_id: event.id, event_type: event.event_type, source: event.source_service, attempts, exhausted },
                exhausted
                    ? 'Event exhausted retries — marked failed'
                    : 'Event delivery failed, will retry',
            );
        }
    }

    // ── Realtime ────────────────────────────────────────────────────────

    private setupRealtimeSubscription(): void {
        try {
            const channelName = `outbox_central_${Date.now()}`;

            this.subscription = this.supabase
                .channel(channelName)
                .on('postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'outbox_events',
                    },
                    () => {
                        // Any new event from any service triggers immediate poll
                        void this.poll();
                    },
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        this.logger.info('CentralOutboxWorker: realtime subscription active');
                        this.startFallbackPolling();
                    } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                        this.logger.warn(
                            { status },
                            'CentralOutboxWorker: realtime subscription failed, polling only',
                        );
                        if (!this.fallbackTimer) this.startFallbackPolling();
                    }
                });
        } catch (error) {
            this.logger.error(
                { err: error instanceof Error ? error.message : String(error) },
                'CentralOutboxWorker: failed to setup realtime, falling back to polling',
            );
            this.startFallbackPolling();
        }
    }

    private startFallbackPolling(): void {
        if (this.fallbackTimer || this.stopped) return;
        this.fallbackTimer = setInterval(() => void this.poll(), Math.max(this.pollIntervalMs, 30_000));
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private formatError(error: unknown): string {
        if (error && typeof error === 'object' && 'message' in error) {
            return String((error as any).message);
        }
        return String(error);
    }
}
