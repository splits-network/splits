/**
 * AI Model Management Types
 * Used by shared-ai-client, ai-service admin routes, and admin frontend
 */

export type AiProvider = 'openai' | 'anthropic';

export type AiOperation =
    | 'fit_review'
    | 'resume_extraction'
    | 'call_summarization'
    | 'resume_generation'
    | 'resume_parsing'
    | 'embedding'
    | 'matching_scoring';

export interface AiModelConfig {
    id: string;
    operation: AiOperation;
    provider: AiProvider;
    model: string;
    temperature: number | null;
    max_tokens: number | null;
    is_active: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface AiModelPricing {
    id: string;
    provider: AiProvider;
    model: string;
    input_cost_per_1k: number;
    output_cost_per_1k: number;
    embedding_cost_per_1k: number | null;
    effective_from: string;
    created_at: string;
}

export interface AiUsageLog {
    id: string;
    operation: AiOperation;
    provider: AiProvider;
    model: string;
    service_name: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    estimated_cost: number | null;
    duration_ms: number | null;
    success: boolean;
    error_code: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

export interface AiUsageStats {
    period: string;
    total_cost: number;
    total_tokens: number;
    total_calls: number;
    by_operation: Array<{
        operation: AiOperation;
        cost: number;
        tokens: number;
        calls: number;
    }>;
    by_provider: Array<{
        provider: AiProvider;
        cost: number;
        tokens: number;
        calls: number;
    }>;
    daily_series: Array<{
        date: string;
        cost: number;
        tokens: number;
        calls: number;
    }>;
}

export interface AiModelConfigUpdate {
    provider?: AiProvider;
    model?: string;
    temperature?: number | null;
    max_tokens?: number | null;
    is_active?: boolean;
    notes?: string | null;
}

export interface AiConfigTestResult {
    success: boolean;
    provider: AiProvider;
    model: string;
    input_tokens: number;
    output_tokens: number;
    duration_ms: number;
    estimated_cost: number;
    response_preview: string;
    error?: string;
}
