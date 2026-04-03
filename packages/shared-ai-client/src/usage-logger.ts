/**
 * Fire-and-forget usage logger.
 * Inserts into ai_usage_logs and calculates estimated cost from pricing table.
 * Never throws — failures are logged but don't affect the AI call.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AiOperation, AiProvider } from '@splits-network/shared-types';
import type { ConfigCache } from './config-cache';

export interface UsageEntry {
    operation: AiOperation;
    provider: AiProvider;
    model: string;
    serviceName: string;
    inputTokens: number;
    outputTokens: number;
    durationMs: number;
    success: boolean;
    errorCode?: string;
    metadata?: Record<string, unknown>;
}

export class UsageLogger {
    constructor(
        private supabase: SupabaseClient,
        private configCache: ConfigCache,
        private logger: { warn: (obj: Record<string, unknown>, msg: string) => void },
    ) {}

    /** Log usage — fire-and-forget, never throws */
    log(entry: UsageEntry): void {
        this.insertUsageLog(entry).catch((err) => {
            this.logger.warn({ err, operation: entry.operation }, 'Failed to log AI usage');
        });
    }

    private async insertUsageLog(entry: UsageEntry): Promise<void> {
        // Calculate estimated cost from pricing table
        let estimatedCost: number | null = null;

        const pricing = await this.configCache.getPricing(entry.provider, entry.model);
        if (pricing) {
            const inputCost = (entry.inputTokens / 1000) * pricing.inputCostPer1k;
            const outputCost = (entry.outputTokens / 1000) * pricing.outputCostPer1k;
            estimatedCost = Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
        }

        await this.supabase.from('ai_usage_logs').insert({
            operation: entry.operation,
            provider: entry.provider,
            model: entry.model,
            service_name: entry.serviceName,
            input_tokens: entry.inputTokens,
            output_tokens: entry.outputTokens,
            estimated_cost: estimatedCost,
            duration_ms: entry.durationMs,
            success: entry.success,
            error_code: entry.errorCode ?? null,
            metadata: entry.metadata ?? null,
        });
    }
}
