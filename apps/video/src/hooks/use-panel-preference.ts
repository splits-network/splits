'use client';

import { useState, useCallback, useEffect } from 'react';

type PanelTab = 'context' | 'chat' | 'history';

interface PanelPreference {
    activeTab: PanelTab;
    isOpen: boolean;
}

const STORAGE_PREFIX = 'call-panel-';

function getStorageKey(callId: string): string {
    return `${STORAGE_PREFIX}${callId}`;
}

function loadPreference(callId: string, defaultOpen: boolean): PanelPreference {
    if (typeof window === 'undefined') {
        return { activeTab: 'context', isOpen: defaultOpen };
    }

    try {
        const stored = localStorage.getItem(getStorageKey(callId));
        if (stored) {
            const parsed = JSON.parse(stored) as Partial<PanelPreference>;
            return {
                activeTab: parsed.activeTab || 'context',
                isOpen: parsed.isOpen ?? defaultOpen,
            };
        }
    } catch {
        // Ignore parse errors
    }

    return { activeTab: 'context', isOpen: defaultOpen };
}

/**
 * Persists panel tab selection and open/close state per call in localStorage.
 */
export function usePanelPreference(callId: string, defaultOpen: boolean) {
    const [preference, setPreference] = useState<PanelPreference>(() =>
        loadPreference(callId, defaultOpen),
    );

    // Persist on change
    useEffect(() => {
        try {
            localStorage.setItem(getStorageKey(callId), JSON.stringify(preference));
        } catch {
            // Storage full or unavailable
        }
    }, [callId, preference]);

    const setActiveTab = useCallback((tab: PanelTab) => {
        setPreference((prev) => ({ ...prev, activeTab: tab }));
    }, []);

    const toggleOpen = useCallback(() => {
        setPreference((prev) => ({ ...prev, isOpen: !prev.isOpen }));
    }, []);

    const setOpen = useCallback((open: boolean) => {
        setPreference((prev) => ({ ...prev, isOpen: open }));
    }, []);

    return {
        activeTab: preference.activeTab,
        isOpen: preference.isOpen,
        setActiveTab,
        toggleOpen,
        setOpen,
    };
}
