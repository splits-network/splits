'use client';

import Link from 'next/link';

interface AtAGlanceItem {
    label: string;
    value: string | number;
    icon: string;
    href: string;
    priority: 'urgent' | 'important' | 'info';
    visible: boolean;
}

interface AtAGlanceProps {
    messageCount?: number;
    notificationCount?: number;
    profileCompletion?: number;
    pendingApplications?: number;
}

export default function AtAGlance({
    messageCount = 0,
    notificationCount = 0,
    profileCompletion = 100,
    pendingApplications = 0,
}: AtAGlanceProps) {
    // Build items based on available data
    const items: AtAGlanceItem[] = [
        {
            label: 'Unread Messages',
            value: messageCount,
            icon: 'fa-messages',
            href: '/portal/messages',
            priority: messageCount > 0 ? 'important' : 'info',
            visible: messageCount > 0,
        },
        {
            label: 'New Notifications',
            value: notificationCount,
            icon: 'fa-bell',
            href: '/portal/notifications',
            priority: notificationCount > 0 ? 'important' : 'info',
            visible: notificationCount > 0,
        },
        {
            label: 'Pending Actions',
            value: pendingApplications,
            icon: 'fa-clipboard-check',
            href: '/portal/applications',
            priority: pendingApplications > 0 ? 'urgent' : 'info',
            visible: pendingApplications > 0,
        },
        {
            label: 'Complete Your Profile',
            value: `${profileCompletion}%`,
            icon: 'fa-user-check',
            href: '/portal/profile',
            priority: profileCompletion < 50 ? 'urgent' : profileCompletion < 100 ? 'important' : 'info',
            visible: profileCompletion < 100,
        },
    ];

    // Get priority color class
    const getPriorityClass = (priority: string): string => {
        switch (priority) {
            case 'urgent':
                return 'text-error';
            case 'important':
                return 'text-warning';
            default:
                return 'text-info';
        }
    };

    const visibleItems = items.filter(item => item.visible);

    // If no items to show
    if (visibleItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-base-content/60">
                <i className="fa-duotone fa-regular fa-check-circle text-3xl mb-2 text-success"></i>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs">No pending actions</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {visibleItems.map((item, index) => (
                <Link
                    key={index}
                    href={item.href}
                    className="block p-3 bg-base-100 rounded-lg hover:bg-base-200/70 hover:shadow-md border border-transparent hover:border-primary/30 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0 ${getPriorityClass(item.priority)} group-hover:bg-base-300 transition-colors`}>
                            <i className={`fa-duotone fa-regular ${item.icon} text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-base-content/80 group-hover:text-primary transition-colors truncate">
                                {item.label}
                            </div>
                            <div className={`text-sm font-bold ${getPriorityClass(item.priority)}`}>
                                {item.value}
                            </div>
                        </div>
                        <i className="fa-duotone fa-regular fa-chevron-right text-xs text-base-content/30 group-hover:text-primary transition-colors flex-shrink-0"></i>
                    </div>
                </Link>
            ))}
        </div>
    );
}
