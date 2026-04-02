/**
 * V3 Support Event Publisher — Redis Pub/Sub
 *
 * Publishes real-time support events to Redis channels for
 * WebSocket fan-out by the support-gateway.
 *
 * Channels:
 * - support:conv:{id} — visitor-facing per-conversation
 * - admin:support:conv:{id} — admin-facing per-conversation
 * - admin:support:queue — admin queue (new conversations, messages)
 * - support:admin-presence — admin online/offline status
 *
 * Ported from V2 SupportEventPublisher with identical event
 * names and payload structures for backward compatibility.
 */

import { Redis } from 'ioredis';
import { Logger } from '@splits-network/shared-logging';

export interface SupportEventPayload {
  type: string;
  eventVersion: number;
  serverTime: string;
  data: Record<string, any>;
}

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export class SupportEventPublisher {
  private redis: Redis;
  private logger: Logger;

  constructor(redisConfig: RedisConfig, logger: Logger) {
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

  /** Publish to both visitor and admin channels for a conversation. */
  async publishToConversation(
    conversationId: string,
    payload: SupportEventPayload,
  ): Promise<void> {
    const visitorChannel = `support:conv:${conversationId}`;
    const adminChannel = `admin:support:conv:${conversationId}`;
    await Promise.all([
      this.publish(visitorChannel, payload),
      this.publish(adminChannel, payload),
    ]);
  }

  /** Publish to the admin queue channel. */
  async publishToAdminQueue(payload: SupportEventPayload): Promise<void> {
    await this.publish('admin:support:queue', payload);
  }

  /** Publish admin presence change. */
  async publishAdminPresence(online: boolean): Promise<void> {
    await this.publish('support:admin-presence', {
      type: 'admin.presence',
      eventVersion: 1,
      serverTime: new Date().toISOString(),
      data: { online },
    });
  }

  /** Check if any support admin is online (has a Redis presence key). */
  async isAnyAdminOnline(): Promise<boolean> {
    const keys = await this.redis.keys('presence:support-admin:*');
    return keys.length > 0;
  }

  private async publish(
    channel: string,
    payload: SupportEventPayload,
  ): Promise<void> {
    const message = JSON.stringify(payload);
    await this.redis.publish(channel, message);
    this.logger.debug({ channel, type: payload.type }, 'Support event published');
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
