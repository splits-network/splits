'use client';

interface NotificationEmptyStateProps {
    filter: 'all' | 'unread';
    onShowAll: () => void;
}

export default function NotificationEmptyState({ filter, onShowAll }: NotificationEmptyStateProps) {
    return (
        <div className="text-center py-12">
            <i className="fa-solid fa-inbox text-6xl text-base-content/20 mb-4"></i>
            <p className="text-lg text-base-content/60">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </p>
            {filter === 'unread' && (
                <button
                    type="button"
                    className="btn btn-ghost btn-sm mt-4"
                    onClick={onShowAll}
                >
                    View all notifications
                </button>
            )}
        </div>
    );
}