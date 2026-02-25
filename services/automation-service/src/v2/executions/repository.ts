import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AutomationExecution, ExecutionFilters, CreateExecutionInput } from './types';

export class AutomationExecutionRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    private mapRow(row: any): AutomationExecution {
        return {
            id: row.id,
            rule_id: row.rule_id,
            entity_type: row.entity_type,
            entity_id: row.entity_id,
            trigger_event_type: row.trigger_event_type,
            status: row.status,
            requires_approval: row.requires_approval,
            trigger_data: row.trigger_data,
            execution_result: row.execution_result,
            executed_at: row.executed_at,
            error_message: row.error_message,
            approved_by: row.approved_by,
            approved_at: row.approved_at,
            rejected_by: row.rejected_by,
            rejected_at: row.rejected_at,
            rejection_reason: row.rejection_reason,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async findExecutions(filters: ExecutionFilters = {}): Promise<{
        data: AutomationExecution[];
        total: number;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('automation_executions')
            .select('*', { count: 'exact' });

        if (filters.rule_id) query = query.eq('rule_id', filters.rule_id);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
        if (typeof filters.requires_approval === 'boolean') {
            query = query.eq('requires_approval', filters.requires_approval);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return {
            data: (data || []).map((row) => this.mapRow(row)),
            total: count || 0,
        };
    }

    async findExecution(id: string): Promise<AutomationExecution | null> {
        const { data, error } = await this.supabase
            .from('automation_executions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data ? this.mapRow(data) : null;
    }

    async createExecution(input: CreateExecutionInput): Promise<AutomationExecution> {
        const { data, error } = await this.supabase
            .from('automation_executions')
            .insert({
                rule_id: input.rule_id,
                entity_type: input.entity_type,
                entity_id: input.entity_id,
                trigger_event_type: input.trigger_event_type ?? null,
                requires_approval: input.requires_approval,
                trigger_data: input.trigger_data ?? null,
                status: input.requires_approval ? 'pending' : 'approved',
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapRow(data);
    }

    async updateExecution(
        id: string,
        updates: Partial<AutomationExecution>,
    ): Promise<AutomationExecution> {
        const payload: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (typeof updates.status !== 'undefined') payload.status = updates.status;
        if (typeof updates.execution_result !== 'undefined') payload.execution_result = updates.execution_result;
        if (typeof updates.executed_at !== 'undefined') payload.executed_at = updates.executed_at;
        if (typeof updates.error_message !== 'undefined') payload.error_message = updates.error_message;
        if (typeof updates.approved_by !== 'undefined') payload.approved_by = updates.approved_by;
        if (typeof updates.approved_at !== 'undefined') payload.approved_at = updates.approved_at;
        if (typeof updates.rejected_by !== 'undefined') payload.rejected_by = updates.rejected_by;
        if (typeof updates.rejected_at !== 'undefined') payload.rejected_at = updates.rejected_at;
        if (typeof updates.rejection_reason !== 'undefined') payload.rejection_reason = updates.rejection_reason;

        const { data, error } = await this.supabase
            .from('automation_executions')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapRow(data);
    }

    async incrementRuleCounters(ruleId: string, triggered: boolean, executed: boolean): Promise<void> {
        if (triggered) {
            await this.supabase.rpc('increment_rule_triggered', { rule_uuid: ruleId }).throwOnError();
        }
        if (executed) {
            await this.supabase.rpc('increment_rule_executed', { rule_uuid: ruleId }).throwOnError();
        }
    }
}
