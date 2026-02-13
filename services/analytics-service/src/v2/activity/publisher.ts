import Redis from 'ioredis';
import { ActivityService } from './service';

const PUBLISH_CHANNEL = 'dashboard:activity';
const PUBLISH_INTERVAL_MS = 15_000; // 15 seconds

export class ActivityPublisher {
    private interval: ReturnType<typeof setInterval> | null = null;

    constructor(
        private activityService: ActivityService,
        private pubRedis: Redis,
    ) {}

    start(): void {
        if (this.interval) return;

        this.interval = setInterval(async () => {
            try {
                const snapshot = await this.activityService.getSnapshot();
                const event = {
                    type: 'activity.updated',
                    eventVersion: 1,
                    serverTime: new Date().toISOString(),
                    data: snapshot,
                };
                await this.pubRedis.publish(PUBLISH_CHANNEL, JSON.stringify(event));
            } catch (err) {
                console.error('[ActivityPublisher] Failed to publish snapshot:', err);
            }
        }, PUBLISH_INTERVAL_MS);

        console.log('[ActivityPublisher] Started (15s interval)');
    }

    stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('[ActivityPublisher] Stopped');
        }
    }
}
