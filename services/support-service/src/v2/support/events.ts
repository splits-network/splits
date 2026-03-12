import Redis from 'ioredis';
import { Logger } from '@splits-network/shared-logging';

export interface SupportEventPayload {
    type: string;
    eventVersion: number;
    serverTime: string;
    data: Record<string, any>;
}

export class SupportEventPublisher {
    private redis: Redis;
    private logger: Logger;

    constructor(
        redisConfig: { host: string; port: number; password?: string },
        logger: Logger,
    ) {
        this.redis = new Redis({
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password || undefined,
        });
        this.logger = logger;

        this.redis.on('error', (err) => {
            this.logger.error({ err }, 'Redis publish error (support)');
        });
    }

    /** Publish to visitor-facing channel (support-gateway fans out) */
    async publishToConversation(conversationId: string, payload: SupportEventPayload): Promise<void> {
        const visitorChannel = `support:conv:${conversationId}`;
        const adminChannel = `admin:support:conv:${conversationId}`;
        await Promise.all([
            this.publish(visitorChannel, payload),
            this.publish(adminChannel, payload),
        ]);
    }

    /** Publish to admin queue channel (admin-gateway fans out) */
    async publishToAdminQueue(payload: SupportEventPayload): Promise<void> {
        const channel = 'admin:support:queue';
        await this.publish(channel, payload);
    }

    /** Publish admin presence change (support-gateway fans out to visitors) */
    async publishAdminPresence(online: boolean): Promise<void> {
        const channel = 'support:admin-presence';
        await this.publish(channel, {
            type: 'admin.presence',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { online },
        });
    }

    /** Check if any support admin is online (has a Redis presence key) */
    async isAnyAdminOnline(): Promise<boolean> {
        const keys = await this.redis.keys('presence:support-admin:*');
        return keys.length > 0;
    }

    private async publish(channel: string, payload: SupportEventPayload): Promise<void> {
        const message = JSON.stringify(payload);
        await this.redis.publish(channel, message);
        this.logger.debug({ channel, type: payload.type }, 'Support event published');
    }

    async close(): Promise<void> {
        await this.redis.quit();
    }
}
