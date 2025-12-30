/**
 * Notification API Client
 * Typed utilities for fetching and managing in-app notifications
 */

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
export async function fetchNotifications(options?: {
    unreadOnly?: boolean;
    limit?: number;
}): Promise<InAppNotification[]> {
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.set('unreadOnly', 'true');
    if (options?.limit) params.set('limit', options.limit.toString());

    const response = await fetch(`/api/notifications?${params.toString()}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    const json: NotificationListResponse = await response.json();
    return json.data;
}

/**
 * Get unread notification count (for badge)
 */
export async function fetchUnreadCount(): Promise<number> {
    const response = await fetch('/api/notifications/unread-count', {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.statusText}`);
    }

    const json: UnreadCountResponse = await response.json();
    return json.data.count;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
    const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
    });

    if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
    const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Failed to mark all as read: ${response.statusText}`);
    }
}

/**
 * Dismiss a notification (hide from UI)
 */
export async function dismissNotification(notificationId: string): Promise<void> {
    const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Failed to dismiss notification: ${response.statusText}`);
    }
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
