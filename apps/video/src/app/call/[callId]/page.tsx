'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CallDetail } from '@/lib/types';
import { CallExperience } from '@/components/call-experience';

interface SessionData {
    livekitToken: string;
    call: CallDetail;
}

function readSessionData(callId: string): SessionData | null {
    try {
        const raw = sessionStorage.getItem(`call-${callId}`);
        if (!raw) return null;
        return JSON.parse(raw) as SessionData;
    } catch {
        return null;
    }
}

export default function CallPage({
    params,
}: {
    params: Promise<{ callId: string }>;
}) {
    const { callId } = use(params);
    const router = useRouter();
    const [sessionData] = useState<SessionData | null>(() => readSessionData(callId));
    const cleaned = useRef(false);

    // Clean up sessionStorage after successful read (once only)
    useEffect(() => {
        if (sessionData && !cleaned.current) {
            cleaned.current = true;
            sessionStorage.removeItem(`call-${callId}`);
        }
    }, [sessionData, callId]);

    // Redirect if no session data found
    useEffect(() => {
        if (!sessionData) {
            router.replace('/error?reason=invalid');
        }
    }, [sessionData, router]);

    if (!sessionData) {
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
