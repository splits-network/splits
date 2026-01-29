import Redis from 'ioredis';
import { Logger } from '@splits-network/shared-logging';

export interface ChatEventPayload {
    type: string;
    eventVersion: number;
    serverTime: string;
    data: Record<string, any>;
}

export class ChatEventPublisher {
    private redis: Redis;
    private logger: Logger;

    constructor(
        redisConfig: { host: string; port: number; password?: string },
        logger: Logger
    ) {
        this.redis = new Redis({
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password || undefined,
        });
        this.logger = logger;

        this.redis.on('error', (err) => {
            this.logger.error({ err }, 'Redis publish error');
        });
    }

    async publishToConversation(conversationId: string, payload: ChatEventPayload): Promise<void> {
        const channel = `conv:${conversationId}`;
        await this.publish(channel, payload);
    }

    async publishToUser(userId: string, payload: ChatEventPayload): Promise<void> {
        const channel = `user:${userId}`;
        await this.publish(channel, payload);
    }

    async publish(channel: string, payload: ChatEventPayload): Promise<void> {
        const message = JSON.stringify(payload);
        await this.redis.publish(channel, message);
        this.logger.debug({ channel, type: payload.type }, 'Chat event published');
    }

    async close(): Promise<void> {
        await this.redis.quit();
    }
}
