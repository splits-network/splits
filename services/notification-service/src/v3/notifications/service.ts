/**
 * Notifications V3 Service — Business Logic
 *
 * Scoped access: users can only see/manage their own notifications.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError, BadRequestError } from '@splits-network/shared-fastify';
import { NotificationRepository } from './repository';
import { NotificationListParams, NotificationUpdateInput } from './types';
import { IEventPublisher } from '../../v2/shared/events';

export class NotificationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: NotificationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async resolveUserId(clerkUserId: string): Promise<string> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }
    return context.identityUserId;
  }

  async getAll(params: NotificationListParams, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const { data, total } = await this.repository.findAll(params, userId);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const notification = await this.repository.findById(id);
    if (!notification) throw new NotFoundError('Notification', id);
    if (notification.recipient_user_id !== userId) {
      throw new ForbiddenError('You do not have access to this notification');
    }
    return notification;
  }

  async update(id: string, input: NotificationUpdateInput, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Notification', id);
    if (existing.recipient_user_id !== userId) {
      throw new ForbiddenError('You do not have access to this notification');
    }
    return this.repository.update(id, input);
  }

  async dismiss(id: string, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Notification', id);
    if (existing.recipient_user_id !== userId) {
      throw new ForbiddenError('You do not have access to this notification');
    }
    await this.repository.softDelete(id);
  }

  async markAllAsRead(clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const count = await this.repository.markAllAsRead(userId);
    return { marked: count };
  }

  async getUnreadCount(clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const count = await this.repository.countUnread(userId);
    return { unread: count };
  }

  async getCountsByCategory(clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    return this.repository.countUnreadByCategory(userId);
  }
}
