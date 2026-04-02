/**
 * OpenAI provider — raw fetch to api.openai.com
 * Handles chat completions and embeddings.
 */

import { withRetry, RetryOptions } from './retry';
import type {
    IAiProvider,
    IEmbeddingProvider,
    ChatMessage,
    ChatCompletionResult,
    EmbeddingResult,
} from './types';

const CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const EMBEDDING_URL = 'https://api.openai.com/v1/embeddings';
const DEFAULT_TIMEOUT_MS = 60_000;

export class OpenAIProvider implements IAiProvider, IEmbeddingProvider {
    private retryOpts: RetryOptions;

    constructor(
        private apiKey: string,
        private logger?: RetryOptions['logger'],
    ) {
        this.retryOpts = { logger: this.logger };
    }

    async chatCompletion(
        model: string,
        messages: ChatMessage[],
        options: {
            temperature?: number;
            maxTokens?: number;
            jsonMode?: boolean;
            signal?: AbortSignal;
        } = {},
    ): Promise<ChatCompletionResult> {
        const body: Record<string, unknown> = {
            model,
            messages,
        };
        if (options.temperature !== undefined) body.temperature = options.temperature;
        if (options.maxTokens !== undefined) body.max_tokens = options.maxTokens;
        if (options.jsonMode) body.response_format = { type: 'json_object' };

        const signal = options.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS);

        return withRetry(async () => {
            const response = await fetch(CHAT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(body),
                signal,
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                const err = new Error(`OpenAI API error: ${response.status} ${errorText}`);
                (err as any).status = response.status;
                throw err;
            }

            const data: any = await response.json();
            const content = data?.choices?.[0]?.message?.content ?? '';

            return {
                content,
                inputTokens: data?.usage?.prompt_tokens ?? 0,
                outputTokens: data?.usage?.completion_tokens ?? 0,
                model: data?.model ?? model,
                provider: 'openai' as const,
            };
        }, this.retryOpts);
    }

    async embedding(
        model: string,
        text: string,
        options: { dimensions?: number; signal?: AbortSignal } = {},
    ): Promise<EmbeddingResult> {
        const body: Record<string, unknown> = { model, input: text };
        if (options.dimensions) body.dimensions = options.dimensions;

        const signal = options.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS);

        return withRetry(async () => {
            const response = await fetch(EMBEDDING_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(body),
                signal,
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                const err = new Error(`OpenAI Embedding error: ${response.status} ${errorText}`);
                (err as any).status = response.status;
                throw err;
            }

            const data: any = await response.json();

            return {
                embedding: data?.data?.[0]?.embedding ?? [],
                inputTokens: data?.usage?.total_tokens ?? 0,
                model: data?.model ?? model,
                provider: 'openai' as const,
            };
        }, this.retryOpts);
    }
}
