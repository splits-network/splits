/**
 * AiClient — the main orchestrator.
 * Resolves config per operation, dispatches to the right provider, logs usage.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Redis } from 'ioredis';
import type { Logger } from '@splits-network/shared-logging';
import type { AiOperation } from '@splits-network/shared-types';
import type {
    IAiClient,
    ChatMessage,
    ChatCompletionOptions,
    ChatCompletionResult,
    EmbeddingOptions,
    EmbeddingResult,
} from './types';
import { ConfigCache } from './config-cache';
import { UsageLogger } from './usage-logger';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';

export interface AiClientConfig {
    supabase: SupabaseClient;
    redis: Redis;
    serviceName: string;
    logger: Logger;
    openaiApiKey: string;
    anthropicApiKey?: string;
}

export class AiClient implements IAiClient {
    private configCache: ConfigCache;
    private usageLogger: UsageLogger;
    private openai: OpenAIProvider;
    private anthropic: AnthropicProvider | null;
    private serviceName: string;
    private logger: Logger;

    constructor(config: AiClientConfig) {
        this.serviceName = config.serviceName;
        this.logger = config.logger;

        this.configCache = new ConfigCache(config.supabase, config.redis, config.logger);
        this.usageLogger = new UsageLogger(config.supabase, this.configCache, config.logger);

        this.openai = new OpenAIProvider(config.openaiApiKey, config.logger);
        this.anthropic = config.anthropicApiKey
            ? new AnthropicProvider(config.anthropicApiKey, config.logger)
            : null;
    }

    async chatCompletion(
        operation: AiOperation,
        messages: ChatMessage[],
        options: ChatCompletionOptions = {},
    ): Promise<ChatCompletionResult> {
        const config = await this.configCache.getModelConfig(operation);
        const provider = this.getProvider(config.provider);

        const temperature = options.temperature ?? config.temperature ?? undefined;
        const maxTokens = options.maxTokens ?? config.maxTokens ?? undefined;

        const startMs = Date.now();
        let result: ChatCompletionResult;

        try {
            result = await provider.chatCompletion(config.model, messages, {
                temperature,
                maxTokens,
                jsonMode: options.jsonMode,
                signal: options.signal,
            });
        } catch (err) {
            const durationMs = Date.now() - startMs;
            this.usageLogger.log({
                operation,
                provider: config.provider,
                model: config.model,
                serviceName: this.serviceName,
                inputTokens: 0,
                outputTokens: 0,
                durationMs,
                success: false,
                errorCode: (err as any)?.status?.toString() ?? 'unknown',
            });
            throw err;
        }

        const durationMs = Date.now() - startMs;
        this.usageLogger.log({
            operation,
            provider: result.provider,
            model: result.model,
            serviceName: this.serviceName,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
            durationMs,
            success: true,
        });

        return result;
    }

    async embedding(
        operation: AiOperation,
        text: string,
        options: EmbeddingOptions = {},
    ): Promise<EmbeddingResult> {
        const config = await this.configCache.getModelConfig(operation);

        if (config.provider !== 'openai') {
            throw new Error(
                `Embedding is only supported with OpenAI. Operation "${operation}" is configured for "${config.provider}".`,
            );
        }

        const startMs = Date.now();
        let result: EmbeddingResult;

        try {
            result = await this.openai.embedding(config.model, text, {
                dimensions: options.dimensions,
                signal: options.signal,
            });
        } catch (err) {
            const durationMs = Date.now() - startMs;
            this.usageLogger.log({
                operation,
                provider: 'openai',
                model: config.model,
                serviceName: this.serviceName,
                inputTokens: 0,
                outputTokens: 0,
                durationMs,
                success: false,
                errorCode: (err as any)?.status?.toString() ?? 'unknown',
            });
            throw err;
        }

        const durationMs = Date.now() - startMs;
        this.usageLogger.log({
            operation,
            provider: 'openai',
            model: result.model,
            serviceName: this.serviceName,
            inputTokens: result.inputTokens,
            outputTokens: 0,
            durationMs,
            success: true,
        });

        return result;
    }

    /** Expose config cache for admin route cache invalidation */
    get config(): ConfigCache {
        return this.configCache;
    }

    private getProvider(provider: string) {
        if (provider === 'anthropic') {
            if (!this.anthropic) {
                throw new Error(
                    'Anthropic provider requested but ANTHROPIC_API_KEY is not configured.',
                );
            }
            return this.anthropic;
        }
        return this.openai;
    }
}
