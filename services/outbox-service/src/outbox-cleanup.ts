import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';

/**
 * Periodically deletes old published/failed outbox events to prevent
 * unbounded table growth.
 *
 * Runs on a configurable interval (default: every hour).
 * Deletes events older than `retentionDays` (default: 7 days).
 */
export class OutboxCleanup {
    private timer: NodeJS.Timeout | null = null;

    constructor(
        private supabase: SupabaseClient,
        private logger: Logger,
        private intervalMs = 3_600_000,    // 1 hour
        private retentionDays = 7,
    ) {}

    start(): void {
        if (this.timer) return;

        // Run once immediately
        void this.cleanup();

        this.timer = setInterval(() => void this.cleanup(), this.intervalMs);
        this.logger.info(
            { intervalMs: this.intervalMs, retentionDays: this.retentionDays },
            'OutboxCleanup started',
        );
    }

    stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private async cleanup(): Promise<void> {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - this.retentionDays);
        const cutoffISO = cutoff.toISOString();

        try {
            // Delete published events older than retention period
            const { count: publishedCount, error: pubErr } = await this.supabase
                .from('outbox_events')
                .delete({ count: 'exact' })
                .eq('status', 'published')
                .lt('created_at', cutoffISO);

            if (pubErr) {
                this.logger.error({ err: pubErr.message }, 'OutboxCleanup: failed to delete published events');
            }

            // Delete failed events older than retention period
            const { count: failedCount, error: failErr } = await this.supabase
                .from('outbox_events')
                .delete({ count: 'exact' })
                .eq('status', 'failed')
                .lt('created_at', cutoffISO);

            if (failErr) {
                this.logger.error({ err: failErr.message }, 'OutboxCleanup: failed to delete failed events');
            }

            const totalDeleted = (publishedCount ?? 0) + (failedCount ?? 0);
            if (totalDeleted > 0) {
                this.logger.info(
                    { published: publishedCount, failed: failedCount, cutoff: cutoffISO },
                    'OutboxCleanup: purged old events',
                );
            }
        } catch (err) {
            this.logger.error(
                { err: err instanceof Error ? err.message : String(err) },
                'OutboxCleanup: unexpected error during cleanup',
            );
        }
    }
}
