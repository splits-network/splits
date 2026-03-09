import { useState, useCallback } from 'react';
import { SplitsApiClient } from '@splits-network/shared-api-client';
import type { TokenResult } from '../types';

type GetTokenFn = () => Promise<string | null>;

/**
 * Hook for fetching LiveKit call tokens.
 *
 * @param apiBaseUrl - Gateway base URL (e.g. http://localhost:3000)
 * @param getToken - Clerk getToken for authenticated calls (omit for magic link only)
 */
export function useCallToken(apiBaseUrl: string, getToken?: GetTokenFn) {
    const [tokenData, setTokenData] = useState<TokenResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchAuthenticatedToken = useCallback(
        async (interviewId: string): Promise<TokenResult | null> => {
            setLoading(true);
            setError(null);
            try {
                const authToken = getToken ? await getToken() : null;
                const client = new SplitsApiClient({
                    baseUrl: apiBaseUrl,
                    authToken: authToken || undefined,
                });

                const result = await client.post<{ data: TokenResult }>(
                    `/interviews/${interviewId}/token`,
                );
                const data = result.data;
                setTokenData(data);
                return data;
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to get token';
                setError(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [apiBaseUrl],
    );

    const exchangeMagicLink = useCallback(
        async (magicToken: string): Promise<TokenResult | null> => {
            setLoading(true);
            setError(null);
            try {
                const client = new SplitsApiClient({ baseUrl: apiBaseUrl });
                const result = await client.post<{ data: TokenResult }>(
                    '/interviews/join',
                    { token: magicToken },
                );
                const data = result.data;
                setTokenData(data);
                return data;
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
