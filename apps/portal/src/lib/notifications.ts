/**
 * Notification API Client
 * Typed utilities for fetching and managing in-app notifications
 */

import { ApiClient } from './api-client';

export interface InAppNotification {
    id: string;
    event_type: string;
    recipient_user_id: string;
    subject: string;
    channel: 'email' | 'in_app' | 'both';
    status: string;
    read: boolean;
    read_at?: string;
    dismissed: boolean;
    action_url?: string;
    action_label?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category?: string;
    payload?: Record<string, any>;
    created_at: string;
}

export interface NotificationListResponse {
    data: InAppNotification[];
}

export interface UnreadCountResponse {
    data: {
        count: number;
    };
}

/**
 * Fetch notifications for the current user
 */
const API_PATH = '/notifications';

export async function fetchNotifications(
    token: string,
    options?: {
        unreadOnly?: boolean;
        limit?: number;
    }
): Promise<InAppNotification[]> {
    const apiClient = new ApiClient(token);
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.set('unreadOnly', 'true');
    if (options?.limit) params.set('limit', options.limit.toString());

    const response: NotificationListResponse = await apiClient.get(`${API_PATH}?${params.toString()}`);
    return response.data;
}

/**
 * Get unread notification count (for badge)
 */
export async function fetchUnreadCount(token: string): Promise<number> {
    const apiClient = new ApiClient(token);
    const response: UnreadCountResponse = await apiClient.get(`${API_PATH}/unread-count`);
    return response.data.count;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(token: string, notificationId: string): Promise<void> {
    const apiClient = new ApiClient(token);
    await apiClient.patch(`${API_PATH}/${notificationId}`, { read: true });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(token: string): Promise<void> {
    const apiClient = new ApiClient(token);
    await apiClient.post(`${API_PATH}/mark-all-read`, {});
}

/**
 * Dismiss a notification (hide from UI)
 */
export async function dismissNotification(token: string, notificationId: string): Promise<void> {
    const apiClient = new ApiClient(token);
    await apiClient.delete(`${API_PATH}/${notificationId}`);
}

/**
 * Format notification time (e.g., "2 minutes ago", "1 hour ago")
 */
export function formatNotificationTime(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return then.toLocaleDateString();
}

/**
 * Get notification icon based on category
 */
export function getNotificationIcon(category?: string): string {
    switch (category) {
        case 'application': return 'fa-file-alt';
        case 'placement': return 'fa-handshake';
        case 'proposal': return 'fa-lightbulb';
        case 'candidate': return 'fa-user';
        case 'collaboration': return 'fa-users';
        case 'invitation': return 'fa-envelope';
        case 'system': return 'fa-cog';
        default: return 'fa-bell';
    }
}

/**
 * Get priority badge color
 */
export function getPriorityColor(priority: string): string {
    switch (priority) {
        case 'urgent': return 'badge-error';
        case 'high': return 'badge-warning';
        case 'normal': return 'badge-info';
        case 'low': return 'badge-ghost';
        default: return 'badge-ghost';
    }
}
