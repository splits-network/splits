'use client';

import { useAuth } from '@clerk/nextjs';
import { ActivityTracker } from '@splits-network/shared-ui';

export function CandidateActivityTrackerWrapper() {
    const { userId } = useAuth();
    return <ActivityTracker app="candidate" userId={userId || undefined} userType="candidate" />;
}
