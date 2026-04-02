/**
 * Anthropic provider — raw fetch to api.anthropic.com
 * Handles chat completions only (no embedding support).
 */

import { withRetry, RetryOptions } from './retry';
import type { IAiProvider, ChatMessage, ChatCompletionResult } from './types';

const MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_TOKENS = 4096;

export class AnthropicProvider implements IAiProvider {
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
        // Anthropic requires system message as a separate top-level field
        let systemPrompt: string | undefined;
        const nonSystemMessages: Array<{ role: string; content: string }> = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                // Concatenate multiple system messages
                systemPrompt = systemPrompt
                    ? `${systemPrompt}\n\n${msg.content}`
                    : msg.content;
            } else {
                nonSystemMessages.push({ role: msg.role, content: msg.content });
            }
        }

        // Anthropic has no response_format — instruct via system prompt
        if (options.jsonMode && systemPrompt) {
            systemPrompt += '\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code fences, no explanation outside the JSON.';
        } else if (options.jsonMode) {
            systemPrompt = 'IMPORTANT: Respond with valid JSON only. No markdown, no code fences, no explanation outside the JSON.';
        }

        const body: Record<string, unknown> = {
            model,
            messages: nonSystemMessages,
            max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
        };
        if (systemPrompt) body.system = systemPrompt;
        if (options.temperature !== undefined) body.temperature = options.temperature;

        const signal = options.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS);

        return withRetry(async () => {
            const response = await fetch(MESSAGES_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': ANTHROPIC_VERSION,
                },
                body: JSON.stringify(body),
                signal,
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                const err = new Error(`Anthropic API error: ${response.status} ${errorText}`);
                (err as any).status = response.status;
                throw err;
            }

            const data: any = await response.json();
            const content = data?.content?.[0]?.text ?? '';

            return {
                content,
                inputTokens: data?.usage?.input_tokens ?? 0,
                outputTokens: data?.usage?.output_tokens ?? 0,
                model: data?.model ?? model,
                provider: 'anthropic' as const,
            };
        }, this.retryOpts);
    }
}
