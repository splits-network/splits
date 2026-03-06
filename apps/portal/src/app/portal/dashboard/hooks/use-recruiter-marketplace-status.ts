'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import {
    calculateProfileCompleteness,
    getTopPriorityFields,
    type CompletenessResult,
} from '@/lib/utils/profile-completeness';

interface RecruiterMarketplaceData {
    tagline?: string;
    location?: string;
    years_experience?: number;
    bio?: string;
    industries?: string[];
    specialties?: string[];
    marketplace_enabled?: boolean;
    show_success_metrics?: boolean;
    show_contact_info?: boolean;
}

export function useRecruiterMarketplaceStatus() {
    const { getToken } = useAuth();
    const [recruiter, setRecruiter] = useState<RecruiterMarketplaceData | null>(null);
    const [completeness, setCompleteness] = useState<CompletenessResult | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get('/recruiters/me');
            const data = response?.data;
            if (!data) return;

            setRecruiter(data);
            setCompleteness(calculateProfileCompleteness(data));
        } catch (err) {
            console.error('[MarketplaceStatus] Failed to load:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const missingFields = completeness ? getTopPriorityFields(completeness.missingFields) : [];

    const needsAttention =
        !loading &&
        recruiter !== null &&
        (!recruiter.marketplace_enabled || completeness?.tier === 'incomplete');

    return { recruiter, completeness, missingFields, needsAttention, loading, refresh };
}
