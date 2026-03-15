'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'splits-support-session-id';

function generateSessionId(): string {
    return crypto.randomUUID();
}

export function useSupportSession() {
    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        let id = localStorage.getItem(STORAGE_KEY);
        if (!id) {
            id = generateSessionId();
            localStorage.setItem(STORAGE_KEY, id);
        }
        setSessionId(id);
    }, []);

    const getSessionId = useCallback(() => {
        return localStorage.getItem(STORAGE_KEY) || sessionId;
    }, [sessionId]);

    return { sessionId, getSessionId };
}
