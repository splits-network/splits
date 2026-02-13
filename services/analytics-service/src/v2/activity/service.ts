import Redis from 'ioredis';
import { HeartbeatPayload, ActivitySnapshot } from './types';

const ONLINE_KEY = 'activity:online';
const SESSION_PREFIX = 'activity:session:';
const TIMELINE_PREFIX = 'activity:timeline:';
const SESSION_TTL = 120; // seconds
const TIMELINE_TTL = 7200; // 2 hours
const STALE_THRESHOLD = 120_000; // 2 minutes in ms

function minuteKey(date: Date): string {
    const y = date.getUTCFullYear();
    const mo = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    const h = String(date.getUTCHours()).padStart(2, '0');
    const mi = String(date.getUTCMinutes()).padStart(2, '0');
    return `${y}${mo}${d}${h}${mi}`;
}

function minuteLabel(key: string): string {
    // Convert YYYYMMDDHHMM to HH:MM
    return `${key.slice(8, 10)}:${key.slice(10, 12)}`;
}

export class ActivityService {
    constructor(private redis: Redis) {}

    async recordHeartbeat(payload: HeartbeatPayload): Promise<void> {
        const now = Date.now();
        const currentMinute = minuteKey(new Date(now));
        const sessionKey = `${SESSION_PREFIX}${payload.session_id}`;
        const timelineKey = `${TIMELINE_PREFIX}${currentMinute}`;

        const pipeline = this.redis.pipeline();

        // 1. Track online presence (sorted set scored by timestamp)
        pipeline.zadd(ONLINE_KEY, now, payload.session_id);

        // 2. Store session metadata
        pipeline.hset(sessionKey, {
            app: payload.app,
            page: payload.page,
            status: payload.status,
            user_id: payload.user_id || '',
        });
        pipeline.expire(sessionKey, SESSION_TTL);

        // 3. Track unique users per minute
        pipeline.sadd(timelineKey, payload.session_id);
        pipeline.expire(timelineKey, TIMELINE_TTL);

        await pipeline.exec();
    }

    async getSnapshot(): Promise<ActivitySnapshot> {
        const now = Date.now();
        const cutoff = now - STALE_THRESHOLD;

        // 1. Clean stale entries
        await this.redis.zremrangebyscore(ONLINE_KEY, '-inf', cutoff);

        // 2. Get all online session IDs
        const sessionIds = await this.redis.zrangebyscore(ONLINE_KEY, cutoff, '+inf');
        const totalOnline = sessionIds.length;

        // 3. Get session metadata for breakdown
        const byApp = { portal: 0, candidate: 0, corporate: 0 };
        let authenticated = 0;
        let anonymous = 0;

        if (sessionIds.length > 0) {
            const pipeline = this.redis.pipeline();
            for (const sid of sessionIds) {
                pipeline.hgetall(`${SESSION_PREFIX}${sid}`);
            }
            const results = await pipeline.exec();

            if (results) {
                for (const [err, data] of results) {
                    if (err || !data) continue;
                    const session = data as Record<string, string>;
                    const app = session.app as keyof typeof byApp;
                    if (app in byApp) byApp[app]++;
                    if (session.user_id) authenticated++;
                    else anonymous++;
                }
            }
        }

        // 4. Build timeline (last 30 minutes)
        const timeline: { minute: string; count: number }[] = [];
        const timelinePipeline = this.redis.pipeline();
        const minuteKeys: string[] = [];

        for (let i = 29; i >= 0; i--) {
            const d = new Date(now - i * 60_000);
            const mk = minuteKey(d);
            minuteKeys.push(mk);
            timelinePipeline.scard(`${TIMELINE_PREFIX}${mk}`);
        }

        const timelineResults = await timelinePipeline.exec();
        if (timelineResults) {
            for (let i = 0; i < minuteKeys.length; i++) {
                const [err, count] = timelineResults[i];
                timeline.push({
                    minute: minuteLabel(minuteKeys[i]),
                    count: err ? 0 : (count as number) || 0,
                });
            }
        }

        return {
            total_online: totalOnline,
            by_app: byApp,
            authenticated,
            anonymous,
            timeline,
            timestamp: new Date().toISOString(),
        };
    }
}
