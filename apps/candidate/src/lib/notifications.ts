/**
 * Notification API Client
 * Typed utilities for fetching and managing in-app notifications
 * 
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
