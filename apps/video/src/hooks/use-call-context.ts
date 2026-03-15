'use client';

import { useState, useEffect } from 'react';
import type { CallDetail, EntityData, CallHistoryEntry } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface UseCallContextResult {
    entities: EntityData[];
    history: CallHistoryEntry[];
    isLoading: boolean;
    isGuest: boolean;
}

/**
 * Fetches enriched entity data and call history for the side panel.
 * Guest users (magic-link only, no participant match) get empty results.
 */
export function useCallContext(call: CallDetail, accessToken: string | null): UseCallContextResult {
    const [entities, setEntities] = useState<EntityData[]>([]);
    const [history, setHistory] = useState<CallHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Guest = no access token (reduced panel, chat only)
    const isGuest = !accessToken;

    useEffect(() => {
        if (isGuest || call.entity_links.length === 0) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        async function fetchContext() {
            try {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                if (accessToken) {
                    headers['Authorization'] = `Bearer ${accessToken}`;
                }

                // Fetch entity data for each link
                const entityPromises = call.entity_links.map(async (link) => {
                    try {
                        const res = await fetch(
                            `${API_URL}/api/v3/calls/${call.id}/entities/${link.entity_type}/${link.entity_id}`,
                            { headers },
                        );
                        if (!res.ok) return buildFallbackEntity(link.entity_type, link.entity_id);
                        const body = await res.json();
                        return body.data as EntityData;
                    } catch {
                        return buildFallbackEntity(link.entity_type, link.entity_id);
                    }
                });

                // Fetch call history for the first entity link
                const primaryLink = call.entity_links[0];
                const historyPromise = fetch(
                    `${API_URL}/api/v3/calls?entity_type=${primaryLink.entity_type}&entity_id=${primaryLink.entity_id}&limit=10`,
                    { headers },
                ).then(async (res) => {
                    if (!res.ok) return [];
                    const body = await res.json();
                    const items = body.data?.items || body.data || [];
                    return items
                        .filter((c: CallHistoryEntry) => c.id !== call.id)
                        .slice(0, 10) as CallHistoryEntry[];
                }).catch(() => [] as CallHistoryEntry[]);

                const [resolvedEntities, resolvedHistory] = await Promise.all([
                    Promise.all(entityPromises),
                    historyPromise,
                ]);

                if (cancelled) return;
                setEntities(resolvedEntities);
                setHistory(resolvedHistory);
            } catch {
                // Silently fail — panel shows fallback
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchContext();

        return () => {
            cancelled = true;
        };
    }, [call.id, isGuest, accessToken]);

    return { entities, history, isLoading, isGuest };
}

function buildFallbackEntity(entityType: string, entityId: string): EntityData {
    return {
        entity_type: entityType as EntityData['entity_type'],
        entity_id: entityId,
        name: `${entityType.charAt(0).toUpperCase()}${entityType.slice(1)}`,
        subtitle: null,
        logo_url: null,
        details: { id: entityId.slice(0, 8) },
    };
}
