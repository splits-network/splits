/**
 * Automation Rule Domain Types
 * Matches the automation_rules table schema
 */

export interface AutomationRule {
    id: string;
    name: string;
    description: string | null;
    rule_type: string;
    status: 'active' | 'paused' | 'disabled';
    trigger_conditions: Record<string, any>;
    actions: Record<string, any>;
    requires_human_approval: boolean;
    max_executions_per_day: number | null;
    times_triggered: number;
    times_executed: number;
    last_triggered_at: string | null;
    last_executed_at: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface RuleFilters {
    rule_type?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export type RuleUpdate = Partial<Omit<AutomationRule, 'id' | 'created_by' | 'created_at' | 'updated_at'>>;
