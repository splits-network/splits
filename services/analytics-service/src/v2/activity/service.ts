import Redis from 'ioredis';
import { HeartbeatPayload, ActivitySnapshot, UserType, ALL_USER_TYPES, ALL_APPS, TimelinePoint } from './types';

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
    return `${key.slice(8, 10)}:${key.slice(10, 12)}`;
}

export class ActivityService {
    constructor(private redis: Redis) {}

    async recordHeartbeat(payload: HeartbeatPayload): Promise<void> {
        const now = Date.now();
        const currentMinute = minuteKey(new Date(now));
        const sessionKey = `${SESSION_PREFIX}${payload.session_id}`;
        const timelineKey = `${TIMELINE_PREFIX}${currentMinute}`;
        const userType: UserType = payload.user_type || (payload.user_id ? 'recruiter' : 'anonymous');

        const pipeline = this.redis.pipeline();

        // 1. Track online presence (sorted set scored by timestamp)
        pipeline.zadd(ONLINE_KEY, now, payload.session_id);

        // 2. Store session metadata
        pipeline.hset(sessionKey, {
            app: payload.app,
            page: payload.page,
            status: payload.status,
            user_id: payload.user_id || '',
            user_type: userType,
        });
        pipeline.expire(sessionKey, SESSION_TTL);

        // 3. Track unique users per minute (total)
        pipeline.sadd(timelineKey, payload.session_id);
        pipeline.expire(timelineKey, TIMELINE_TTL);

        // 4. Track per-app timeline
        const appTimelineKey = `${TIMELINE_PREFIX}${currentMinute}:app:${payload.app}`;
        pipeline.sadd(appTimelineKey, payload.session_id);
        pipeline.expire(appTimelineKey, TIMELINE_TTL);

        // 5. Track per-role timeline
        const roleTimelineKey = `${TIMELINE_PREFIX}${currentMinute}:role:${userType}`;
        pipeline.sadd(roleTimelineKey, payload.session_id);
        pipeline.expire(roleTimelineKey, TIMELINE_TTL);

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
        const byRole: Record<UserType, number> = {
            recruiter: 0, company_admin: 0, hiring_manager: 0, candidate: 0, anonymous: 0,
        };
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
                    const role = session.user_type as UserType;
                    if (role && role in byRole) byRole[role]++;
                    else byRole.anonymous++;
                }
            }
        }

        // 4. Build minute keys for last 30 minutes
        const minuteKeys: string[] = [];
        for (let i = 29; i >= 0; i--) {
            minuteKeys.push(minuteKey(new Date(now - i * 60_000)));
        }

        // 5. Pipeline: total + per-app + per-role SCARD for each minute
        const timelinePipeline = this.redis.pipeline();
        for (const mk of minuteKeys) {
            timelinePipeline.scard(`${TIMELINE_PREFIX}${mk}`);
            for (const app of ALL_APPS) {
                timelinePipeline.scard(`${TIMELINE_PREFIX}${mk}:app:${app}`);
            }
            for (const role of ALL_USER_TYPES) {
                timelinePipeline.scard(`${TIMELINE_PREFIX}${mk}:role:${role}`);
            }
        }

        const timelineResults = await timelinePipeline.exec();

        // 6. Parse results — each minute has 1 + 3 + 5 = 9 entries
        const RESULTS_PER_MINUTE = 1 + ALL_APPS.length + ALL_USER_TYPES.length;
        const timeline: TimelinePoint[] = [];
        const timelineByApp: Record<string, TimelinePoint[]> = {};
        const timelineByRole: Record<string, TimelinePoint[]> = {};

        for (const app of ALL_APPS) timelineByApp[app] = [];
        for (const role of ALL_USER_TYPES) timelineByRole[role] = [];

        if (timelineResults) {
            for (let i = 0; i < minuteKeys.length; i++) {
                const base = i * RESULTS_PER_MINUTE;
                const label = minuteLabel(minuteKeys[i]);
                const val = (idx: number) => {
                    const [err, count] = timelineResults[base + idx];
                    return err ? 0 : (count as number) || 0;
                };

                timeline.push({ minute: label, count: val(0) });

                let offset = 1;
                for (const app of ALL_APPS) {
                    timelineByApp[app].push({ minute: label, count: val(offset++) });
                }
                for (const role of ALL_USER_TYPES) {
                    timelineByRole[role].push({ minute: label, count: val(offset++) });
                }
            }
        }

        return {
            total_online: totalOnline,
            by_app: byApp,
            by_role: byRole,
            authenticated,
            anonymous,
            timeline,
            timeline_by_app: timelineByApp,
            timeline_by_role: timelineByRole,
            timestamp: new Date().toISOString(),
        };
    }
}
