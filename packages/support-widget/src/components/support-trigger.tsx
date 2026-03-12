'use client';

import { useSupportChatOptional } from '../context/support-provider';

export function SupportTrigger() {
    const support = useSupportChatOptional();
    if (!support) return null;

    return (
        <button
            type="button"
            onClick={support.toggle}
            className="btn btn-ghost btn-md btn-square"
            aria-label="Get help"
            title="Support"
        >
            <span className="relative">
                <i className="fa-duotone fa-regular fa-headset text-base-content/60" />
                {support.unreadCount > 0 && (
                    <span className="badge badge-primary badge-xs absolute -top-2 -right-2.5 rounded-full">
                        {support.unreadCount > 99 ? '99+' : support.unreadCount}
                    </span>
                )}
            </span>
        </button>
    );
}
