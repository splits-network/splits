import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

vi.mock('@supabase/supabase-js', () => {
    return {
        createClient: () => ({}),
    };
});

import { NotificationServiceV2 } from '../../src/v2/notifications/service';
import { registerNotificationRoutes } from '../../src/v2/notifications/routes';

describe('Notification routes (integration)', () => {
    const config = {
        supabaseUrl: 'http://supabase',
        supabaseKey: 'key',
        eventPublisher: { publish: vi.fn() },
    };

    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(NotificationServiceV2.prototype, 'listNotifications').mockResolvedValue({
            data: [],
            pagination: { total: 0, page: 1, limit: 25, total_pages: 0 },
        } as any);
        vi.spyOn(NotificationServiceV2.prototype, 'getNotification').mockResolvedValue({
            id: 'notif-1',
        } as any);
        vi.spyOn(NotificationServiceV2.prototype, 'updateNotification').mockResolvedValue({
            id: 'notif-1',
        } as any);
        vi.spyOn(NotificationServiceV2.prototype, 'dismissNotification').mockResolvedValue();
        vi.spyOn(NotificationServiceV2.prototype, 'markAllAsRead').mockResolvedValue();
        vi.spyOn(NotificationServiceV2.prototype, 'getUnreadCount').mockResolvedValue({
            data: { count: 5 },
        } as any);
        vi.spyOn(NotificationServiceV2.prototype, 'getUnreadCountsByCategory').mockResolvedValue({
            data: { system: 2 },
        } as any);
    });

    it('rejects list without user context', async () => {
        const app = Fastify();
        await registerNotificationRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/notifications',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('lists notifications with parsed filters', async () => {
        const listSpy = vi.spyOn(NotificationServiceV2.prototype, 'listNotifications');
        const app = Fastify();
        await registerNotificationRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/notifications?filters=%7B%22flag%22%3Atrue%7D&limit=10&page=2',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(listSpy).toHaveBeenCalledWith('clerk-1', expect.objectContaining({
            filters: { flag: true },
            limit: 10,
            page: 2,
        }));
    });

    it('marks all notifications as read', async () => {
        const markSpy = vi.spyOn(NotificationServiceV2.prototype, 'markAllAsRead');
        const app = Fastify();
        await registerNotificationRoutes(app, config as any);

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/notifications/mark-all-read',
            headers: {
                'x-clerk-user-id': 'clerk-1',
                'content-type': 'application/json',
            },
            payload: { recipient_user_id: 'user-99' },
        });

        expect(response.statusCode).toBe(204);
        expect(markSpy).toHaveBeenCalledWith('clerk-1', 'user-99');
    });

    it('returns unread count', async () => {
        const app = Fastify();
        await registerNotificationRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/notifications/unread-count?recipient_user_id=user-1',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).data.count).toBe(5);
    });

    it('returns unread counts by category', async () => {
        const app = Fastify();
        await registerNotificationRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/notifications/counts-by-category',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).data.system).toBe(2);
    });

    it('fetches a notification by id', async () => {
        const app = Fastify();
        await registerNotificationRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/notifications/notif-1',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).data.id).toBe('notif-1');
    });

    it('updates a notification', async () => {
        const updateSpy = vi.spyOn(NotificationServiceV2.prototype, 'updateNotification');
        const app = Fastify();
        await registerNotificationRoutes(app, config as any);

        const response = await app.inject({
            method: 'PATCH',
            url: '/api/v2/notifications/notif-1',
            headers: {
                'x-clerk-user-id': 'clerk-1',
                'content-type': 'application/json',
            },
            payload: { status: 'read' },
        });

        expect(response.statusCode).toBe(200);
        expect(updateSpy).toHaveBeenCalledWith('clerk-1', 'notif-1', { status: 'read' });
    });

    it('dismisses a notification', async () => {
        const dismissSpy = vi.spyOn(NotificationServiceV2.prototype, 'dismissNotification');
        const app = Fastify();
        await registerNotificationRoutes(app, config as any);

        const response = await app.inject({
            method: 'DELETE',
            url: '/api/v2/notifications/notif-1',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(204);
        expect(dismissSpy).toHaveBeenCalledWith('clerk-1', 'notif-1');
    });
});
