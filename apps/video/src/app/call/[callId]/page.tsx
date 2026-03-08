'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CallDetail } from '@/lib/types';
import { CallExperience } from '@/components/call-experience';

interface SessionData {
    livekitToken: string;
    call: CallDetail;
}

export default function CallPage({
    params,
}: {
    params: Promise<{ callId: string }>;
}) {
    const { callId } = use(params);
    const router = useRouter();
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const key = `call-${callId}`;
        const raw = sessionStorage.getItem(key);

        if (!raw) {
            router.replace('/error?reason=invalid');
            return;
        }

        try {
            const parsed = JSON.parse(raw) as SessionData;
            setSessionData(parsed);
            // Clean up after reading
            sessionStorage.removeItem(key);
        } catch {
            router.replace('/error?reason=invalid');
            return;
        }

        setChecked(true);
    }, [callId, router]);

    if (!sessionData) {
        if (checked) {
            return null; // Redirecting
        }
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    return (
        <CallExperience
            livekitToken={sessionData.livekitToken}
            call={sessionData.call}
        />
    );
}
