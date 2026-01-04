'use client';

interface NotificationHeaderProps {
    unreadCount: number;
    onMarkAllRead: () => void;
}

export default function NotificationHeader({ unreadCount, onMarkAllRead }: NotificationHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                    <p className="text-base-content/60 mt-1">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                )}
            </div>
            {unreadCount > 0 && (
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onMarkAllRead}
                >
                    <i className="fa-solid fa-check-double"></i>
                    Mark all read
                </button>
            )}
        </div>
    );
}