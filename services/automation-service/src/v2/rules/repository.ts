import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AutomationRule, RuleFilters, RuleUpdate } from './types';

export interface CreateRuleInput {
    name: string;
    description?: string | null;
    trigger_type: string;
    condition: Record<string, any>;
    action: Record<string, any>;
    status?: AutomationRule['status'];
    requires_approval?: boolean;
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
            trigger_type: row.trigger_type,
            condition: row.condition || {},
            action: row.action || {},
            status: row.status,
            requires_approval: row.requires_approval,
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

        if (filters.trigger_type) {
            query = query.eq('trigger_type', filters.trigger_type);
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
                trigger_type: input.trigger_type,
                condition: input.condition,
                action: input.action,
                status: input.status || 'active',
                requires_approval: input.requires_approval ?? false,
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

        if (typeof updates.name !== 'undefined') {
            payload.name = updates.name;
        }
        if (typeof updates.description !== 'undefined') {
            payload.description = updates.description;
        }
        if (typeof updates.trigger_type !== 'undefined') {
            payload.trigger_type = updates.trigger_type;
        }
        if (typeof updates.condition !== 'undefined') {
            payload.condition = updates.condition;
        }
        if (typeof updates.action !== 'undefined') {
            payload.action = updates.action;
        }
        if (typeof updates.status !== 'undefined') {
            payload.status = updates.status;
        }
        if (typeof updates.requires_approval !== 'undefined') {
            payload.requires_approval = updates.requires_approval;
        }

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
