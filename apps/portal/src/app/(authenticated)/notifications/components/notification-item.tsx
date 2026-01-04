'use client';

import {
    formatNotificationTime,
    getNotificationIcon,
    getPriorityColor,
    InAppNotification
} from '@/lib/notifications';

interface NotificationItemProps {
    notification: InAppNotification;
    onClick: (notification: InAppNotification) => void;
    onDismiss: (notificationId: string, event: React.MouseEvent) => void;
}

export default function NotificationItem({ notification, onClick, onDismiss }: NotificationItemProps) {
    return (
        <div
            className={`
                flex gap-4 p-4 cursor-pointer hover:bg-base-200 transition-colors
                ${!notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''}
            `}
            onClick={() => onClick(notification)}
        >
            {/* Icon */}
            <div className="shrink-0">
                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${!notification.read ? 'bg-primary text-primary-content' : 'bg-base-300'}
                `}>
                    <i className={`fa-solid ${getNotificationIcon(notification.category)} text-lg`}></i>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                        <p className={`text-base ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.subject}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-base-content/60">
                                {formatNotificationTime(notification.created_at)}
                            </span>
                            {notification.category && (
                                <span className="badge badge-sm badge-ghost">
                                    {notification.category}
                                </span>
                            )}
                            {notification.priority !== 'normal' && (
                                <span className={`badge badge-sm ${getPriorityColor(notification.priority)}`}>
                                    {notification.priority}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                        <button
                            type="button"
                            className="btn btn-ghost btn-xs btn-circle"
                            onClick={(e) => onDismiss(notification.id, e)}
                            aria-label="Dismiss"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                </div>
                {notification.action_label && notification.action_url && (
                    <div className="mt-2">
                        <span className="text-sm text-primary inline-flex items-center gap-1">
                            {notification.action_label}
                            <i className="fa-solid fa-arrow-right text-xs"></i>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}