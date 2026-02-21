'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
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
            // Use /candidates/me for direct current-user lookup instead of a filtered list query
            const response = await client.getCurrentCandidate();

            const profile = response?.data;
            if (profile) {
                setProfileCompletion(calculateProfileCompleteness(profile));

                const resumeExists = profile.documents?.some(
                    (doc: any) =>
                        doc.type === 'resume' ||
                        doc.name?.toLowerCase().includes('resume'),
                ) || false;
                setHasResume(resumeExists);
            }
        } catch {
            // Profile completion is non-critical — silently fail so the dashboard
            // still renders even when the ATS service is unavailable.
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
