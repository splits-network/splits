'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export function useCandidateNotifications() {
    const { getToken } = useAuth();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            const [messagesResult, notificationsResult] = await Promise.allSettled([
                client.get('/chat/conversations'),
                client.get('/notifications', {
                    params: { filters: { unread_only: true }, limit: 100 },
                }),
            ]);

            if (messagesResult.status === 'fulfilled') {
                const conversations = messagesResult.value.data || [];
                const totalUnread = conversations.reduce(
                    (sum: number, conv: any) => sum + (conv.unread_count || 0),
                    0,
                );
                setUnreadMessages(totalUnread);
            }

            if (notificationsResult.status === 'fulfilled') {
                const unreadNotifs = notificationsResult.value.data || [];
                setUnreadNotifications(unreadNotifs.length);
            }
        } catch (err) {
            console.error('[CandidateNotifications] Failed to load:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { unreadMessages, unreadNotifications, loading, refresh };
}
