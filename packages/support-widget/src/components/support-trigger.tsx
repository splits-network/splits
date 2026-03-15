'use client';

import { useSupportChatOptional } from '../context/support-provider';

export function SupportTrigger() {
    const support = useSupportChatOptional();
    if (!support) return null;

    const adminOnline = support.adminOnline;

    return (
        <button
            type="button"
            onClick={support.toggle}
            className="btn btn-ghost btn-md btn-square relative"
            aria-label="Get help"
            title={adminOnline ? 'Support — Live help available' : 'Support'}
        >
            {adminOnline && (
                <span className="absolute inset-0 rounded-btn animate-pulse bg-success/15 pointer-events-none" />
            )}
            <span className="relative">
                <i className={`fa-duotone fa-regular fa-headset ${adminOnline ? 'text-success' : 'text-base-content/60'}`} />
                {support.unreadCount > 0 && (
                    <span className="badge badge-primary badge-xs absolute -top-2 -right-2.5 rounded-full">
                        {support.unreadCount > 99 ? '99+' : support.unreadCount}
                    </span>
                )}
            </span>
        </button>
    );
}
