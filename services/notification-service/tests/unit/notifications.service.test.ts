import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationServiceV2 } from '../../src/v2/notifications/service';
import type { AccessContext } from '../../src/v2/shared/access';
import type { Notification } from '../../src/v2/notifications/types';

const baseAccess: AccessContext = {
    identityUserId: 'user-1',
    candidateId: null,
    recruiterId: null,
    organizationIds: [],
    orgWideOrganizationIds: [],
    companyIds: [],
    roles: [],
    isPlatformAdmin: false,
    error: '',
};

const adminAccess: AccessContext = {
    ...baseAccess,
    identityUserId: null,
    isPlatformAdmin: true,
};

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
    id: 'notif-1',
    event_type: 'event.test',
    recipient_email: 'user@example.com',
    recipient_user_id: 'user-1',
    subject: 'Subject',
    template: 'template',
    payload: {},
    channel: 'email',
    status: 'pending',
    read: false,
    read_at: null,
    dismissed: false,
    action_url: null,
    action_label: null,
    priority: 'normal',
    category: 'general',
    resend_message_id: null,
    error_message: null,
    sent_at: null,
    created_at: new Date().toISOString(),
    ...overrides,
});

describe('NotificationServiceV2 (unit)', () => {
    const repository = {
        findNotifications: vi.fn(),
        findNotification: vi.fn(),
        updateNotification: vi.fn(),
        dismissNotification: vi.fn(),
        markAllAsRead: vi.fn(),
        countUnread: vi.fn(),
        countUnreadByCategory: vi.fn(),
    };

    const resolver = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('scopes listNotifications to identity user for non-admins', async () => {
        resolver.mockResolvedValue(baseAccess);
        repository.findNotifications.mockResolvedValue({ data: [], total: 0 });
        const service = new NotificationServiceV2(repository as any, resolver);

        const result = await service.listNotifications('clerk-1', {
            recipient_user_id: 'user-2',
            page: 2,
            limit: 10,
        });

        expect(repository.findNotifications).toHaveBeenCalledWith(
            expect.objectContaining({
                recipient_user_id: 'user-1',
                page: 2,
                limit: 10,
            })
        );
        expect(result.pagination.total_pages).toBe(0);
    });

    it('preserves requested recipient for platform admins', async () => {
        resolver.mockResolvedValue(adminAccess);
        repository.findNotifications.mockResolvedValue({ data: [], total: 5 });
        const service = new NotificationServiceV2(repository as any, resolver);

        await service.listNotifications('clerk-1', { recipient_user_id: 'user-9' });

        expect(repository.findNotifications).toHaveBeenCalledWith(
            expect.objectContaining({ recipient_user_id: 'user-9' })
        );
    });

    it('throws when identity user is missing for non-admins', async () => {
        resolver.mockResolvedValue({ ...baseAccess, identityUserId: null, isPlatformAdmin: false });
        const service = new NotificationServiceV2(repository as any, resolver);

        await expect(
            service.listNotifications('clerk-1', {})
        ).rejects.toThrow('User identity not found');
    });

    it('rejects unauthorized access to a notification', async () => {
        resolver.mockResolvedValue(baseAccess);
        repository.findNotification.mockResolvedValue(
            makeNotification({ recipient_user_id: 'other-user' })
        );
        const service = new NotificationServiceV2(repository as any, resolver);

        await expect(service.getNotification('clerk-1', 'notif-1'))
            .rejects.toThrow('Not authorized to access this notification');
    });

    it('publishes update events on updateNotification', async () => {
        resolver.mockResolvedValue(baseAccess);
        repository.findNotification.mockResolvedValue(makeNotification());
        repository.updateNotification.mockResolvedValue(makeNotification({ status: 'sent' }));
        const publish = vi.fn();
        const service = new NotificationServiceV2(repository as any, resolver, { publish } as any);

        await service.updateNotification('clerk-1', 'notif-1', { status: 'sent' });

        expect(publish).toHaveBeenCalledWith('updated', {
            notification_id: 'notif-1',
            updates: { status: 'sent' },
        });
    });

    it('publishes dismissed events on dismissNotification', async () => {
        resolver.mockResolvedValue(baseAccess);
        repository.findNotification.mockResolvedValue(makeNotification());
        const publish = vi.fn();
        const service = new NotificationServiceV2(repository as any, resolver, { publish } as any);

        await service.dismissNotification('clerk-1', 'notif-1');

        expect(repository.dismissNotification).toHaveBeenCalledWith('notif-1');
        expect(publish).toHaveBeenCalledWith('dismissed', { notification_id: 'notif-1' });
    });

    it('marks all as read for admin specified recipient', async () => {
        resolver.mockResolvedValue(adminAccess);
        const service = new NotificationServiceV2(repository as any, resolver);

        await service.markAllAsRead('clerk-1', 'user-99');

        expect(repository.markAllAsRead).toHaveBeenCalledWith('user-99');
    });

    it('uses identity user for unread count', async () => {
        resolver.mockResolvedValue(baseAccess);
        repository.countUnread.mockResolvedValue(3);
        const service = new NotificationServiceV2(repository as any, resolver);

        const result = await service.getUnreadCount('clerk-1');

        expect(repository.countUnread).toHaveBeenCalledWith('user-1');
        expect(result.data.count).toBe(3);
    });

    it('throws when unread counts by category have no identity user', async () => {
        resolver.mockResolvedValue(adminAccess);
        const service = new NotificationServiceV2(repository as any, resolver);

        await expect(service.getUnreadCountsByCategory('clerk-1'))
            .rejects.toThrow('User identity not found');
    });
});
