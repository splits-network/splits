import { NotificationCreateInput, NotificationFilters, NotificationUpdate } from './types';
import { buildPaginationResponse } from '../shared/helpers';
import { NotificationRepositoryV2 } from './repository';
import { EventPublisher } from '../shared/events';

export class NotificationServiceV2 {
    constructor(
        private repository: NotificationRepositoryV2,
        private eventPublisher?: EventPublisher
    ) {}

    async listNotifications(filters: NotificationFilters) {
        const result = await this.repository.findNotifications(filters);
        return {
            data: result.data,
            pagination: buildPaginationResponse(
                filters.page ?? 1,
                filters.limit ?? 25,
                result.total
            ),
        };
    }

    async getNotification(id: string) {
        const notification = await this.repository.findNotification(id);
        if (!notification) {
            throw new Error('Notification not found');
        }
        return notification;
    }

    async createNotification(input: NotificationCreateInput) {
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

    async updateNotification(id: string, updates: NotificationUpdate) {
        await this.getNotification(id);
        const updated = await this.repository.updateNotification(id, updates);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('notifications.updated', {
                notification_id: id,
                updates,
            });
        }

        return updated;
    }

    async dismissNotification(id: string) {
        await this.getNotification(id);
        await this.repository.dismissNotification(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('notifications.dismissed', {
                notification_id: id,
            });
        }
    }
}
