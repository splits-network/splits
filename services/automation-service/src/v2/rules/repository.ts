import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AutomationRule, RuleFilters, RuleUpdate } from './types.js';

export interface CreateRuleInput {
    name: string;
    description?: string | null;
    rule_type: string;
    trigger_conditions: Record<string, any>;
    actions: Record<string, any>;
    status?: AutomationRule['status'];
    requires_human_approval?: boolean;
    max_executions_per_day?: number | null;
    created_by: string;
}

export class AutomationRuleRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private mapRow(row: any): AutomationRule {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            rule_type: row.rule_type,
            status: row.status,
            trigger_conditions: row.trigger_conditions || {},
            actions: row.actions || {},
            requires_human_approval: row.requires_human_approval,
            max_executions_per_day: row.max_executions_per_day,
            times_triggered: row.times_triggered ?? 0,
            times_executed: row.times_executed ?? 0,
            last_triggered_at: row.last_triggered_at,
            last_executed_at: row.last_executed_at,
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async findRules(filters: RuleFilters = {}): Promise<{
        data: AutomationRule[];
        total: number;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('automation_rules')
            .select('*', { count: 'exact' });

        if (filters.rule_type) {
            query = query.eq('rule_type', filters.rule_type);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return {
            data: (data || []).map((row) => this.mapRow(row)),
            total: count || 0,
        };
    }

    async findRule(id: string): Promise<AutomationRule | null> {
        const { data, error } = await this.supabase
            .from('automation_rules')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data ? this.mapRow(data) : null;
    }

    async createRule(input: CreateRuleInput): Promise<AutomationRule> {
        const { data, error } = await this.supabase
            .from('automation_rules')
            .insert({
                name: input.name,
                description: input.description,
                rule_type: input.rule_type,
                trigger_conditions: input.trigger_conditions,
                actions: input.actions,
                status: input.status || 'active',
                requires_human_approval: input.requires_human_approval ?? true,
                max_executions_per_day: input.max_executions_per_day,
                created_by: input.created_by,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async updateRule(id: string, updates: RuleUpdate): Promise<AutomationRule> {
        const payload: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (typeof updates.name !== 'undefined') payload.name = updates.name;
        if (typeof updates.description !== 'undefined') payload.description = updates.description;
        if (typeof updates.rule_type !== 'undefined') payload.rule_type = updates.rule_type;
        if (typeof updates.trigger_conditions !== 'undefined') payload.trigger_conditions = updates.trigger_conditions;
        if (typeof updates.actions !== 'undefined') payload.actions = updates.actions;
        if (typeof updates.status !== 'undefined') payload.status = updates.status;
        if (typeof updates.requires_human_approval !== 'undefined') payload.requires_human_approval = updates.requires_human_approval;
        if (typeof updates.max_executions_per_day !== 'undefined') payload.max_executions_per_day = updates.max_executions_per_day;

        const { data, error } = await this.supabase
            .from('automation_rules')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async deleteRule(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('automation_rules')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}
