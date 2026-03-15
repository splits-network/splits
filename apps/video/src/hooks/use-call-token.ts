'use client';

import { useEffect, useState } from 'react';
import { exchangeToken } from '@/lib/call-api';
import { ExchangeResult, JoinError, JoinState } from '@/lib/types';

interface UseCallTokenResult {
    state: JoinState;
    result: ExchangeResult | null;
    error: JoinError | null;
}

/**
 * Hook that exchanges a magic-link token on mount.
 * No retry — user must get a new link if the token fails.
 */
export function useCallToken(token: string): UseCallTokenResult {
    const [state, setState] = useState<JoinState>('loading');
    const [result, setResult] = useState<ExchangeResult | null>(null);
    const [error, setError] = useState<JoinError | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function exchange() {
            try {
                const data = await exchangeToken(token);
                if (cancelled) return;
                setResult(data);
                setState('confirming');
            } catch (err) {
                if (cancelled) return;
                setError(err as JoinError);
                setState('error');
            }
        }

        exchange();

        return () => {
            cancelled = true;
        };
    }, [token]);

    return { state, result, error };
}
