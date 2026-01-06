'use client';

import { InAppNotification } from '@/lib/notifications';
import NotificationItem from './notification-item';
import NotificationEmptyState from './notification-empty-state';

interface NotificationListProps {
    loading: boolean;
    notifications: InAppNotification[];
    filter: 'all' | 'unread';
    onNotificationClick: (notification: InAppNotification) => void;
    onDismiss: (notificationId: string, event: React.MouseEvent) => void;
    onShowAll: () => void;
}

export default function NotificationList({
    loading,
    notifications,
    filter,
    onNotificationClick,
    onDismiss,
    onShowAll
}: NotificationListProps) {
    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body p-0">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : length === 0 ? (
                    <NotificationEmptyState
                        filter={filter}
                        onShowAll={onShowAll}
                    />
                ) : (
                    <div className="divide-y divide-base-300">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClick={onNotificationClick}
                                onDismiss={onDismiss}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}