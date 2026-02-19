'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface RoleBreakdown {
    id: string;
    title: string;
    location: string;
    status: string;
    applications_count: number;
    interview_count: number;
    offer_count: number;
    hire_count: number;
    days_open: number;
}

export function useRoleBreakdown() {
    const { getToken } = useAuth();
    const [roles, setRoles] = useState<RoleBreakdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);

            // Fetch active roles - backend filters to company via access context
            const rolesResponse: any = await api.get('/jobs', {
                params: {
                    status: 'active',
                    limit: 20,
                    sort_by: 'created_at',
                    sort_order: 'desc',
                },
            });

            const rolesData = rolesResponse?.data || [];

            // Map roles with basic info (stage counts come from stats, not client-side pagination)
            const breakdown: RoleBreakdown[] = rolesData.map((job: any) => {
                const createdDate = new Date(job.created_at);
                const now = new Date();
                const daysOpen = Math.floor(
                    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                return {
                    id: job.id,
                    title: job.title,
                    location: job.location || 'Remote',
                    status: job.status,
                    applications_count: job.applications_count || 0,
                    interview_count: job.interview_count || 0,
                    offer_count: job.offer_count || 0,
                    hire_count: job.hire_count || 0,
                    days_open: daysOpen,
                };
            });

            setRoles(breakdown);
        } catch (err: any) {
            console.error('[RoleBreakdown] Failed to load:', err);
            setError(err.message || 'Failed to load roles');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { roles, loading, error, refresh };
}
