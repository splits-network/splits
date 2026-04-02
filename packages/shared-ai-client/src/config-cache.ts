/**
 * Redis-cached config loader for AI model configs.
 * Resolution: Redis cache → Supabase query → env var fallback.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Redis } from 'ioredis';
import type { AiOperation } from '@splits-network/shared-types';
import type { ResolvedModelConfig, ModelPricing } from './types';

const CONFIG_PREFIX = 'ai:config:';
const PRICING_PREFIX = 'ai:pricing:';
const CONFIG_TTL_SECONDS = 60;
const PRICING_TTL_SECONDS = 300;

/** Hardcoded fallbacks matching current env var defaults — last resort */
const FALLBACK_CONFIGS: Record<AiOperation, ResolvedModelConfig> = {
    fit_review: {
        provider: 'openai',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 2000,
    },
    resume_extraction: {
        provider: 'openai',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.1,
        maxTokens: 4000,
    },
    call_summarization: {
        provider: 'openai',
        model: process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 1500,
    },
    resume_generation: {
        provider: 'openai',
        model: process.env.OPENAI_SMART_RESUME_MODEL || 'gpt-4o',
        temperature: 0.3,
        maxTokens: 4000,
    },
    resume_parsing: {
        provider: 'openai',
        model: process.env.OPENAI_SMART_RESUME_MODEL || 'gpt-4o',
        temperature: 0.1,
        maxTokens: 16000,
    },
    embedding: {
        provider: 'openai',
        model: 'text-embedding-3-small',
        temperature: null,
        maxTokens: null,
    },
    matching_scoring: {
        provider: 'openai',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 500,
    },
};

export class ConfigCache {
    constructor(
        private supabase: SupabaseClient,
        private redis: Redis,
        private logger: { warn: (obj: Record<string, unknown>, msg: string) => void },
    ) {}

    async getModelConfig(operation: AiOperation): Promise<ResolvedModelConfig> {
        // 1. Try Redis cache
        try {
            const cached = await this.redis.get(`${CONFIG_PREFIX}${operation}`);
            if (cached) return JSON.parse(cached);
        } catch {
            // Redis down — fall through to DB
        }

        // 2. Try Supabase
        try {
            const { data, error } = await this.supabase
                .from('ai_model_configs')
                .select('provider, model, temperature, max_tokens, is_active')
                .eq('operation', operation)
                .eq('is_active', true)
                .maybeSingle();

            if (!error && data) {
                const config: ResolvedModelConfig = {
                    provider: data.provider,
                    model: data.model,
                    temperature: data.temperature,
                    maxTokens: data.max_tokens,
                };

                // Cache in Redis (fire-and-forget)
                this.redis
                    .setex(`${CONFIG_PREFIX}${operation}`, CONFIG_TTL_SECONDS, JSON.stringify(config))
                    .catch(() => {});

                return config;
            }
        } catch (err) {
            this.logger.warn({ operation, err }, 'Failed to load AI config from DB, using fallback');
        }

        // 3. Env var fallback
        return FALLBACK_CONFIGS[operation];
    }

    async getPricing(provider: string, model: string): Promise<ModelPricing | null> {
        const cacheKey = `${PRICING_PREFIX}${provider}:${model}`;

        // 1. Try Redis
        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch {
            // Redis down — fall through
        }

        // 2. Try Supabase
        try {
            const { data } = await this.supabase
                .from('ai_model_pricing')
                .select('input_cost_per_1k, output_cost_per_1k, embedding_cost_per_1k')
                .eq('provider', provider)
                .eq('model', model)
                .order('effective_from', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data) {
                const pricing: ModelPricing = {
                    inputCostPer1k: Number(data.input_cost_per_1k),
                    outputCostPer1k: Number(data.output_cost_per_1k),
                    embeddingCostPer1k: data.embedding_cost_per_1k
                        ? Number(data.embedding_cost_per_1k)
                        : null,
                };

                this.redis
                    .setex(cacheKey, PRICING_TTL_SECONDS, JSON.stringify(pricing))
                    .catch(() => {});

                return pricing;
            }
        } catch {
            // DB down — no pricing available
        }

        return null;
    }

    /** Invalidate cached config for an operation (called after admin updates) */
    async invalidateConfig(operation: AiOperation): Promise<void> {
        try {
            await this.redis.del(`${CONFIG_PREFIX}${operation}`);
        } catch {
            // Best effort
        }
    }
}
