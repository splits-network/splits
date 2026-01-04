'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    InAppNotification,
} from '@/lib/notifications';
import NotificationHeader from '@/app/(authenticated)/notifications/components/notification-header';
import NotificationFilters from '@/app/(authenticated)/notifications/components/notification-filters';
import NotificationList from '@/app/(authenticated)/notifications/components/notification-list';

export default function NotificationsPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        loadNotifications();
    }, [filter]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            const data = await fetchNotifications(token, {
                unreadOnly: filter === 'unread',
                limit: 100,
            });
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification: InAppNotification) => {
        if (!notification.read) {
            try {
                const token = await getToken();
                if (!token) return;

                await markAsRead(token, notification.id);
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, read: true } : n
                    )
                );
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }

        if (notification.action_url) {
            router.push(notification.action_url);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            await markAllAsRead(token);
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDismiss = async (notificationId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            const token = await getToken();
            if (!token) return;

            await dismissNotification(token, notificationId);
            setNotifications((prev) =>
                prev.filter((n) => n.id !== notificationId)
            );
        } catch (error) {
            console.error('Failed to dismiss notification:', error);
        }
    };

    // Calculate derived values
    const unreadCount = notifications.filter((n) => !n.read).length;
    const categories = ['all', ...Array.from(new Set(notifications.map((n) => n.category).filter((cat): cat is string => Boolean(cat))))];

    const filteredNotifications = selectedCategory === 'all'
        ? notifications
        : notifications.filter((n) => n.category === selectedCategory);

    return (
        <div className="container mx-auto">
            <NotificationHeader
                unreadCount={unreadCount}
                onMarkAllRead={handleMarkAllRead}
            />

            <NotificationFilters
                filter={filter}
                onFilterChange={setFilter}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
                unreadCount={unreadCount}
            />

            <NotificationList
                loading={loading}
                notifications={filteredNotifications}
                filter={filter}
                onNotificationClick={handleNotificationClick}
                onDismiss={handleDismiss}
                onShowAll={() => setFilter('all')}
            />
        </div>
    );
}
