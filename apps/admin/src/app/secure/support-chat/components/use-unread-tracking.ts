'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'support-chat:last-read';

type LastReadMap = Record<string, string>;

function loadLastRead(): LastReadMap {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveLastRead(map: LastReadMap) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
        // quota exceeded — silent
    }
}

/**
 * Tracks which support conversations have unread messages.
 *
 * Stores `lastReadAt` per conversation in localStorage. A conversation
 * is "unread" when its `last_message_at` is newer than the stored read
 * timestamp AND its status is `waiting_on_admin` (visitor sent a message).
 */
export function useUnreadTracking() {
    const [lastRead, setLastRead] = useState<LastReadMap>({});

    // Load from localStorage on mount
    useEffect(() => {
        setLastRead(loadLastRead());
    }, []);

    /** Mark a conversation as read right now. */
    const markRead = useCallback((conversationId: string) => {
        setLastRead((prev) => {
            const next = { ...prev, [conversationId]: new Date().toISOString() };
            saveLastRead(next);
            return next;
        });
    }, []);

    /** Check if a conversation has unread visitor messages. */
    const isUnread = useCallback(
        (conversationId: string, lastMessageAt: string | null, status: string): boolean => {
            if (!lastMessageAt) return false;
            // Only flag as unread if a visitor message is pending
            if (status !== 'waiting_on_admin' && status !== 'open') return false;

            const readAt = lastRead[conversationId];
            if (!readAt) return true; // never read = unread
            return new Date(lastMessageAt) > new Date(readAt);
        },
        [lastRead],
    );

    return { markRead, isUnread };
}
