/**
 * AI Config V3 Repository — Admin CRUD for model configs, pricing, and usage logs
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
    AiModelConfig,
    AiModelPricing,
    AiUsageLog,
    AiUsageStats,
    AiModelConfigUpdate,
    AiOperation,
    AiProvider,
} from '@splits-network/shared-types';

interface UsageLogParams {
    page?: number;
    limit?: number;
    operation?: string;
    service_name?: string;
    provider?: string;
}

const PERIOD_TO_DAYS: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
};

export class AiConfigRepository {
    constructor(private supabase: SupabaseClient) {}

    // --- Model Configs ---

    async listConfigs(): Promise<AiModelConfig[]> {
        const { data, error } = await this.supabase
            .from('ai_model_configs')
            .select('*')
            .order('operation');

        if (error) throw error;
        return data || [];
    }

    async getConfig(operation: string): Promise<AiModelConfig | null> {
        const { data, error } = await this.supabase
            .from('ai_model_configs')
            .select('*')
            .eq('operation', operation)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async updateConfig(operation: string, patch: AiModelConfigUpdate): Promise<AiModelConfig> {
        const { data, error } = await this.supabase
            .from('ai_model_configs')
            .update({ ...patch, updated_at: new Date().toISOString() })
            .eq('operation', operation)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // --- Pricing ---

    async listPricing(): Promise<AiModelPricing[]> {
        const { data, error } = await this.supabase
            .from('ai_model_pricing')
            .select('*')
            .order('provider')
            .order('model');

        if (error) throw error;
        return data || [];
    }

    async updatePricing(id: string, patch: Partial<Omit<AiModelPricing, 'id' | 'created_at'>>): Promise<AiModelPricing> {
        const { data, error } = await this.supabase
            .from('ai_model_pricing')
            .update(patch)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // --- Usage Logs ---

    async getUsageLogs(params: UsageLogParams): Promise<{ data: AiUsageLog[]; total: number }> {
        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100);
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('ai_usage_logs')
            .select('*', { count: 'exact' });

        if (params.operation) query = query.eq('operation', params.operation);
        if (params.service_name) query = query.eq('service_name', params.service_name);
        if (params.provider) query = query.eq('provider', params.provider);

        query = query.order('created_at', { ascending: false });
        query = query.range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    // --- Usage Stats (aggregated in JS) ---

    async getUsageStats(period: string): Promise<AiUsageStats> {
        const days = PERIOD_TO_DAYS[period] || 30;
        const since = new Date();
        since.setDate(since.getDate() - days);
        const sinceIso = since.toISOString();

        const { data: rows, error } = await this.supabase
            .from('ai_usage_logs')
            .select('operation, provider, total_tokens, estimated_cost, created_at')
            .gte('created_at', sinceIso)
            .order('created_at', { ascending: true });

        if (error) throw error;
        const logs = rows || [];

        let totalCost = 0;
        let totalTokens = 0;
        const byOperation = new Map<string, { cost: number; tokens: number; calls: number }>();
        const byProvider = new Map<string, { cost: number; tokens: number; calls: number }>();
        const byDay = new Map<string, { cost: number; tokens: number; calls: number }>();

        for (const row of logs) {
            const cost = Number(row.estimated_cost) || 0;
            const tokens = row.total_tokens || 0;
            totalCost += cost;
            totalTokens += tokens;

            // By operation
            const opEntry = byOperation.get(row.operation) || { cost: 0, tokens: 0, calls: 0 };
            opEntry.cost += cost;
            opEntry.tokens += tokens;
            opEntry.calls += 1;
            byOperation.set(row.operation, opEntry);

            // By provider
            const provEntry = byProvider.get(row.provider) || { cost: 0, tokens: 0, calls: 0 };
            provEntry.cost += cost;
            provEntry.tokens += tokens;
            provEntry.calls += 1;
            byProvider.set(row.provider, provEntry);

            // By day
            const day = row.created_at.substring(0, 10);
            const dayEntry = byDay.get(day) || { cost: 0, tokens: 0, calls: 0 };
            dayEntry.cost += cost;
            dayEntry.tokens += tokens;
            dayEntry.calls += 1;
            byDay.set(day, dayEntry);
        }

        return {
            period,
            total_cost: totalCost,
            total_tokens: totalTokens,
            total_calls: logs.length,
            by_operation: Array.from(byOperation.entries()).map(([operation, v]) => ({
                operation: operation as AiOperation,
                ...v,
            })),
            by_provider: Array.from(byProvider.entries()).map(([provider, v]) => ({
                provider: provider as AiProvider,
                ...v,
            })),
            daily_series: Array.from(byDay.entries()).map(([date, v]) => ({
                date,
                ...v,
            })),
        };
    }
}
