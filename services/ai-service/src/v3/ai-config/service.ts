/**
 * AI Config V3 Service — Business logic for admin config management
 */

import type { AiOperation, AiModelConfigUpdate, AiConfigTestResult } from '@splits-network/shared-types';
import type { AiClient } from '@splits-network/shared-ai-client';
import { AiConfigRepository } from './repository.js';

export class AiConfigService {
    constructor(
        private repository: AiConfigRepository,
        private aiClient: AiClient,
    ) {}

    async listConfigs() {
        return this.repository.listConfigs();
    }

    async updateConfig(operation: string, patch: AiModelConfigUpdate) {
        const updated = await this.repository.updateConfig(operation, patch);
        await this.aiClient.config.invalidateConfig(operation as AiOperation);
        return updated;
    }

    async testConfig(operation: string): Promise<AiConfigTestResult> {
        const config = await this.repository.getConfig(operation);
        if (!config) {
            return {
                success: false,
                provider: 'openai',
                model: 'unknown',
                input_tokens: 0,
                output_tokens: 0,
                duration_ms: 0,
                estimated_cost: 0,
                response_preview: '',
                error: `No config found for operation "${operation}"`,
            };
        }

        const startMs = Date.now();
        try {
            const result = await this.aiClient.chatCompletion(
                operation as AiOperation,
                [{ role: 'user', content: 'Say hello in one sentence.' }],
            );

            const durationMs = Date.now() - startMs;
            return {
                success: true,
                provider: result.provider,
                model: result.model,
                input_tokens: result.inputTokens,
                output_tokens: result.outputTokens,
                duration_ms: durationMs,
                estimated_cost: 0,
                response_preview: result.content.substring(0, 200),
            };
        } catch (err) {
            const durationMs = Date.now() - startMs;
            return {
                success: false,
                provider: config.provider,
                model: config.model,
                input_tokens: 0,
                output_tokens: 0,
                duration_ms: durationMs,
                estimated_cost: 0,
                response_preview: '',
                error: (err as Error).message,
            };
        }
    }

    async getUsageStats(period: string) {
        return this.repository.getUsageStats(period);
    }

    async getUsageLogs(params: {
        page?: number;
        limit?: number;
        operation?: string;
        service_name?: string;
        provider?: string;
    }) {
        return this.repository.getUsageLogs(params);
    }

    async listPricing() {
        return this.repository.listPricing();
    }

    async updatePricing(id: string, patch: Record<string, unknown>) {
        return this.repository.updatePricing(id, patch);
    }
}
