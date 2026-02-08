'use client';

import { useEffect } from 'react';

const BASE_TITLE = 'Splits Network';

/**
 * Updates the browser tab title with the unread notification count.
 * Shows "(N) Splits Network" when there are unread notifications.
 */
export function useNotificationTabIndicator(unreadCount: number) {
    useEffect(() => {
        if (unreadCount > 0) {
            const display = unreadCount > 99 ? '99+' : unreadCount;
            document.title = `(${display}) ${BASE_TITLE}`;
        } else {
            document.title = BASE_TITLE;
        }

        return () => {
            document.title = BASE_TITLE;
        };
    }, [unreadCount]);
}
