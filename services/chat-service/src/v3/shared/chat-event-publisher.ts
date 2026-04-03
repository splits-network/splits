/**
 * Chat Event Publisher — V3 Real-Time Events via Redis Pub/Sub
 *
 * Publishes real-time events to per-conversation and per-user channels.
 * Ported from V2: services/chat-service/src/v2/chat/events.ts
 *
 * Channel patterns:
 *   conv:{conversationId} — conversation-scoped events (messages, read receipts)
 *   user:{userId}         — user-scoped events (requests, updates, blocks)
 */

import { Redis } from 'ioredis';

export interface ChatEventPayload {
  type: string;
  eventVersion: number;
  serverTime: string;
  data: Record<string, any>;
}

export interface IChatEventPublisher {
  conversationRequested(userId: string, data: { conversationId: string; requestedBy: string }): Promise<void>;
  conversationAccepted(userId: string, data: { conversationId: string; acceptedBy: string }): Promise<void>;
  conversationDeclined(userId: string, data: { conversationId: string; declinedBy: string }): Promise<void>;
  conversationUpdated(userId: string, data: Record<string, any>): Promise<void>;
  messageCreated(conversationId: string, data: { conversationId: string; messageId: string; senderId: string; createdAt: string }): Promise<void>;
  messageUpdated(conversationId: string, data: { messageId: string; conversationId: string }): Promise<void>;
  readReceipt(conversationId: string, data: { conversationId: string; userId: string; lastReadMessageId: string | null }): Promise<void>;
  attachmentUpdated(conversationId: string, data: { attachmentId: string; status: string }): Promise<void>;
  blockCreated(userId: string, data: { blockedUserId: string }): Promise<void>;
  blockRemoved(userId: string, data: { blockedUserId: string }): Promise<void>;
  close(): Promise<void>;
}

export class ChatEventPublisher implements IChatEventPublisher {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  // --- User-scoped events ---

  async conversationRequested(userId: string, data: { conversationId: string; requestedBy: string }) {
    await this.publishToUser(userId, 'conversation.requested', data);
  }

  async conversationAccepted(userId: string, data: { conversationId: string; acceptedBy: string }) {
    await this.publishToUser(userId, 'conversation.accepted', data);
  }

  async conversationDeclined(userId: string, data: { conversationId: string; declinedBy: string }) {
    await this.publishToUser(userId, 'conversation.declined', data);
  }

  async conversationUpdated(userId: string, data: Record<string, any>) {
    await this.publishToUser(userId, 'conversation.updated', data);
  }

  async blockCreated(userId: string, data: { blockedUserId: string }) {
    await this.publishToUser(userId, 'block.created', data);
  }

  async blockRemoved(userId: string, data: { blockedUserId: string }) {
    await this.publishToUser(userId, 'block.removed', data);
  }

  // --- Conversation-scoped events ---

  async messageCreated(conversationId: string, data: { conversationId: string; messageId: string; senderId: string; createdAt: string }) {
    await this.publishToConversation(conversationId, 'message.created', data);
  }

  async messageUpdated(conversationId: string, data: { messageId: string; conversationId: string }) {
    await this.publishToConversation(conversationId, 'message.updated', data);
  }

  async readReceipt(conversationId: string, data: { conversationId: string; userId: string; lastReadMessageId: string | null }) {
    await this.publishToConversation(conversationId, 'read.receipt', data);
  }

  async attachmentUpdated(conversationId: string, data: { attachmentId: string; status: string }) {
    await this.publishToConversation(conversationId, 'attachment.updated', data);
  }

  // --- Channel helpers ---

  private async publishToConversation(conversationId: string, type: string, data: Record<string, any>) {
    await this.publish(`conv:${conversationId}`, { type, eventVersion: 1, serverTime: new Date().toISOString(), data });
  }

  private async publishToUser(userId: string, type: string, data: Record<string, any>) {
    await this.publish(`user:${userId}`, { type, eventVersion: 1, serverTime: new Date().toISOString(), data });
  }

  private async publish(channel: string, payload: ChatEventPayload) {
    const message = JSON.stringify(payload);
    await this.redis.publish(channel, message);
  }

  async close() {
    await this.redis.quit();
  }
}
