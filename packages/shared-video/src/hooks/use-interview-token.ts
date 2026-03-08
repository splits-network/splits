import { useState, useCallback } from 'react';
import type { TokenResult } from '../types';

export function useInterviewToken(apiBaseUrl: string) {
    const [tokenData, setTokenData] = useState<TokenResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchAuthenticatedToken = useCallback(
        async (interviewId: string): Promise<TokenResult | null> => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${apiBaseUrl}/api/v2/interviews/${interviewId}/token`,
                    {
                        method: 'POST',
                        credentials: 'include',
                    },
                );
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error || 'Failed to get token');
                }
                const { data } = await res.json();
                setTokenData(data);
                return data as TokenResult;
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to get token';
                setError(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [apiBaseUrl],
    );

    const exchangeMagicLink = useCallback(
        async (magicToken: string): Promise<TokenResult | null> => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${apiBaseUrl}/api/v2/interviews/join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: magicToken }),
                });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error || 'Invalid or expired link');
                }
                const { data } = await res.json();
                setTokenData(data);
                return data as TokenResult;
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Invalid or expired link';
                setError(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [apiBaseUrl],
    );

    return { tokenData, error, loading, fetchAuthenticatedToken, exchangeMagicLink };
}
