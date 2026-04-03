/**
 * Core types for the AI client abstraction layer.
 * Re-exports shared types and defines internal interfaces.
 */

import type { AiProvider, AiOperation } from '@splits-network/shared-types';

export type { AiProvider, AiOperation };

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionOptions {
    /** Override DB-configured temperature for this call */
    temperature?: number;
    /** Override DB-configured max_tokens for this call */
    maxTokens?: number;
    /** Request JSON-formatted response */
    jsonMode?: boolean;
    /** Abort signal for cancellation */
    signal?: AbortSignal;
}

export interface ChatCompletionResult {
    content: string;
    inputTokens: number;
    outputTokens: number;
    model: string;
    provider: AiProvider;
}

export interface EmbeddingOptions {
    /** Override dimensions (for models that support it) */
    dimensions?: number;
    /** Abort signal for cancellation */
    signal?: AbortSignal;
}

export interface EmbeddingResult {
    embedding: number[];
    inputTokens: number;
    model: string;
    provider: AiProvider;
}

export interface IAiClient {
    chatCompletion(
        operation: AiOperation,
        messages: ChatMessage[],
        options?: ChatCompletionOptions,
    ): Promise<ChatCompletionResult>;

    embedding(
        operation: AiOperation,
        text: string,
        options?: EmbeddingOptions,
    ): Promise<EmbeddingResult>;
}

/** Internal config shape from DB / cache */
export interface ResolvedModelConfig {
    provider: AiProvider;
    model: string;
    temperature: number | null;
    maxTokens: number | null;
}

/** Internal pricing shape for cost calculation */
export interface ModelPricing {
    inputCostPer1k: number;
    outputCostPer1k: number;
    embeddingCostPer1k: number | null;
}

/** Provider-level interface implemented by OpenAI and Anthropic */
export interface IAiProvider {
    chatCompletion(
        model: string,
        messages: ChatMessage[],
        options: {
            temperature?: number;
            maxTokens?: number;
            jsonMode?: boolean;
            signal?: AbortSignal;
        },
    ): Promise<ChatCompletionResult>;
}

export interface IEmbeddingProvider {
    embedding(
        model: string,
        text: string,
        options?: { dimensions?: number; signal?: AbortSignal },
    ): Promise<EmbeddingResult>;
}
