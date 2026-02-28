'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export type ActivityMode = 'admin' | 'all';

export interface ActivityItem {
    id: string;
    type: string;
    description: string;
    actor?: string;
    entityId?: string;
    createdAt: string;
}

export interface AdminActivityResult {
    activities: ActivityItem[];
    loading: boolean;
    error: string | null;
    mode: ActivityMode;
    setMode: (mode: ActivityMode) => void;
}

const GATEWAY_URL = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL || 'http://localhost:3020';

export function useAdminActivity(): AdminActivityResult {
    const { getToken } = useAuth();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<ActivityMode>('admin');

    const fetchActivity = useCallback(
        async (currentMode: ActivityMode) => {
            const token = await getToken().catch(() => null);
            if (!token) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const path =
                    currentMode === 'admin'
                        ? '/admin/identity/admin/activity?scope=admin&limit=20'
                        : '/admin/identity/admin/activity?scope=all&limit=20';

                const res = await fetch(`${GATEWAY_URL}${path}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    setActivities([]);
                    return;
                }

                const payload = (await res.json()) as { data?: ActivityItem[] };
                setActivities(payload.data ?? []);
            } catch {
                setError('Failed to load activity');
                setActivities([]);
            } finally {
                setLoading(false);
            }
        },
        [getToken],
    );

    useEffect(() => {
        void fetchActivity(mode);
    }, [fetchActivity, mode]);

    const handleSetMode = useCallback(
        (newMode: ActivityMode) => {
            setMode(newMode);
        },
        [],
    );

    return { activities, loading, error, mode, setMode: handleSetMode };
}
