'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import type { ApiResponse } from '@splits-network/shared-api-client';
import {
    calculateProfileCompleteness,
    type ProfileCompleteness,
} from '@/lib/utils/profile-completeness';

export function useProfileCompletion() {
    const { getToken } = useAuth();
    const [profileCompletion, setProfileCompletion] = useState<ProfileCompleteness | null>(null);
    const [hasResume, setHasResume] = useState(false);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<ApiResponse<any[]>>('/candidates', {
                params: { limit: 1 },
            });

            const candidates = response.data || [];
            if (candidates.length > 0) {
                const profile = candidates[0];
                setProfileCompletion(calculateProfileCompleteness(profile));

                const resumeExists = profile.documents?.some(
                    (doc: any) =>
                        doc.type === 'resume' ||
                        doc.name?.toLowerCase().includes('resume'),
                ) || false;
                setHasResume(resumeExists);
            }
        } catch (err) {
            console.error('[ProfileCompletion] Failed to load:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { profileCompletion, hasResume, loading, refresh };
}
