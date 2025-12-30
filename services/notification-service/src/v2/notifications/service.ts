import { NotificationCreateInput, NotificationFilters, NotificationUpdate, Notification } from './types';
import { buildPaginationResponse } from '../shared/helpers';
import { NotificationRepositoryV2 } from './repository';
import { EventPublisher } from '../shared/events';
import type { AccessContext } from '../shared/access';

export class NotificationServiceV2 {
    constructor(
        private repository: NotificationRepositoryV2,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: EventPublisher
    ) {}

    private async requirePlatformAdmin(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            throw new Error('Platform admin permissions required');
        }
        return access;
    }

    private async requireIdentityUser(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.identityUserId && !access.isPlatformAdmin) {
            throw new Error('User identity not found');
        }
        return access;
    }

    private ensureRecipientAccess(notification: Notification, access: AccessContext) {
        if (access.isPlatformAdmin) {
            return;
        }

        if (!access.identityUserId || notification.recipient_user_id !== access.identityUserId) {
            throw new Error('Not authorized to access this notification');
        }
    }

    async listNotifications(clerkUserId: string, filters: NotificationFilters) {
        const access = await this.requireIdentityUser(clerkUserId);
        const scopedFilters: NotificationFilters = { ...filters };

        if (!access.isPlatformAdmin && access.identityUserId) {
            scopedFilters.recipient_user_id = access.identityUserId;
        }

        const result = await this.repository.findNotifications(scopedFilters);
        return {
            data: result.data,
            pagination: buildPaginationResponse(
                filters.page ?? 1,
                filters.limit ?? 25,
                result.total
            ),
        };
    }

    async getNotification(clerkUserId: string, id: string) {
        const access = await this.requireIdentityUser(clerkUserId);
        const notification = await this.repository.findNotification(id);
        if (!notification) {
            throw new Error('Notification not found');
        }
        this.ensureRecipientAccess(notification, access);
        return notification;
    }

    async createNotification(clerkUserId: string, input: NotificationCreateInput) {
        await this.requirePlatformAdmin(clerkUserId);
        const notification = await this.repository.createNotification(input);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('notifications.created', {
                notification_id: notification.id,
                event_type: notification.event_type,
                channel: notification.channel,
                recipient: notification.recipient_email,
            });
        }

        return notification;
    }

    async updateNotification(clerkUserId: string, id: string, updates: NotificationUpdate) {
        const access = await this.requireIdentityUser(clerkUserId);
        const notification = await this.getNotification(clerkUserId, id);
        this.ensureRecipientAccess(notification, access);
        const updated = await this.repository.updateNotification(id, updates);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('notifications.updated', {
                notification_id: id,
                updates,
            });
        }

        return updated;
    }

    async dismissNotification(clerkUserId: string, id: string) {
        const access = await this.requireIdentityUser(clerkUserId);
        const notification = await this.getNotification(clerkUserId, id);
        this.ensureRecipientAccess(notification, access);
        await this.repository.dismissNotification(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('notifications.dismissed', {
                notification_id: id,
            });
        }
    }

    async markAllAsRead(clerkUserId: string, recipientUserId?: string) {
        const access = await this.requireIdentityUser(clerkUserId);
        const targetUserId = access.isPlatformAdmin && recipientUserId
            ? recipientUserId
            : access.identityUserId;

        if (!targetUserId) {
            throw new Error('User identity not found');
        }

        await this.repository.markAllAsRead(targetUserId);
    }

    async getUnreadCount(clerkUserId: string, recipientUserId?: string) {
        const access = await this.requireIdentityUser(clerkUserId);
        const targetUserId = access.isPlatformAdmin && recipientUserId
            ? recipientUserId
            : access.identityUserId;

        if (!targetUserId) {
            throw new Error('User identity not found');
        }

        const count = await this.repository.countUnread(targetUserId);
        return { data: { count } };
    }
}
