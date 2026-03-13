import { ExchangeResult, JoinError } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Exchange a magic-link access token for a LiveKit JWT and call details.
 * Throws a JoinError on failure with typed error categories.
 */
export async function exchangeToken(token: string): Promise<ExchangeResult> {
    let response: Response;

    try {
        response = await fetch(`${API_URL}/api/v3/calls/exchange-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });
    } catch {
        throw {
            type: 'unknown',
            message: 'Unable to connect to the server. Please check your connection and try again.',
        } satisfies JoinError;
    }

    if (!response.ok) {
        let message = 'An unexpected error occurred';
        try {
            const body = await response.json();
            message = body.error?.message || body.message || message;
        } catch {
            // Response body not JSON — use default message
        }

        const errorType = mapStatusToErrorType(response.status);
        throw { type: errorType, message } satisfies JoinError;
    }

    const body = await response.json();
    return body.data as ExchangeResult;
}

function mapStatusToErrorType(status: number): JoinError['type'] {
    switch (status) {
        case 404:
            return 'invalid';
        case 410:
            return 'expired';
        case 400:
            return 'not-started';
        default:
            return 'unknown';
    }
}
