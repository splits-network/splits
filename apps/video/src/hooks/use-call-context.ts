'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CallDetail, EntityData, CallHistoryEntry } from '@/lib/types';

interface UseCallContextResult {
    entities: EntityData[];
    history: CallHistoryEntry[];
    isLoading: boolean;
    isGuest: boolean;
}

/**
 * Derives enriched entity data from the call's entity_links (pre-enriched by exchange-token).
 * History is not fetched in guest mode (no auth token available).
 */
export function useCallContext(call: CallDetail, accessToken: string | null): UseCallContextResult {
    const [history] = useState<CallHistoryEntry[]>([]);
    const isGuest = !accessToken;

    // Entity data comes pre-enriched from the exchange-token response
    const entities = useMemo<EntityData[]>(() => {
        if (call.entity_links.length === 0) return [];

        return call.entity_links.map((link) => ({
            entity_type: link.entity_type,
            entity_id: link.entity_id,
            name: link.name || link.entity_type.charAt(0).toUpperCase() + link.entity_type.slice(1),
            subtitle: link.subtitle ?? null,
            logo_url: link.logo_url ?? null,
            details: link.details ?? {},
        }));
    }, [call.entity_links]);

    return { entities, history, isLoading: false, isGuest };
}
