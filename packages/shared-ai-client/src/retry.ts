/**
 * Shared retry logic with exponential backoff.
 * Extracted from the duplicated pattern across ai-service call sites.
 */

export interface RetryOptions {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    logger?: { warn: (obj: Record<string, unknown>, msg: string) => void };
}

const DEFAULTS = {
    maxRetries: 2,
    baseDelayMs: 1000,
    maxDelayMs: 8000,
};

/**
 * Retries on HTTP 429 (rate limit) and 5xx (server error).
 * Non-retryable errors are thrown immediately.
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    opts: RetryOptions = {},
): Promise<T> {
    const maxRetries = opts.maxRetries ?? DEFAULTS.maxRetries;
    const baseDelay = opts.baseDelayMs ?? DEFAULTS.baseDelayMs;
    const maxDelay = opts.maxDelayMs ?? DEFAULTS.maxDelayMs;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
            opts.logger?.warn({ attempt, delayMs: delay }, 'Retrying AI request');
            await new Promise(r => setTimeout(r, delay));
        }

        try {
            return await fn();
        } catch (err: unknown) {
            lastError = err instanceof Error ? err : new Error(String(err));

            // Check if error has a status code indicating non-retryable
            const status = (err as any)?.status ?? (err as any)?.statusCode;
            if (status && status !== 429 && status < 500) {
                throw lastError;
            }
            // Otherwise continue to next retry attempt
        }
    }

    throw lastError ?? new Error('AI request failed after retries');
}
