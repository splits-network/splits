'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

export interface CallTokenResult {
    access_token: string;
    livekit_token: string;
    call_id: string;
}

export function useCallToken() {
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateToken = useCallback(async (callId: string): Promise<CallTokenResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            const res = await client.post(`/calls/${callId}/token`, {}) as { data: CallTokenResult };
            return res.data;
        } catch (err: any) {
            const message = err.message || 'Failed to generate call token';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { generateToken, isLoading, error };
}
