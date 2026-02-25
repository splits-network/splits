/**
 * Automation Execution Domain Types
 * Matches the automation_executions table schema
 */

export interface AutomationExecution {
    id: string;
    rule_id: string;
    entity_type: string;
    entity_id: string;
    trigger_event_type: string | null;
    status: 'pending' | 'approved' | 'executed' | 'failed' | 'rejected';
    requires_approval: boolean;
    trigger_data: Record<string, any> | null;
    execution_result: Record<string, any> | null;
    executed_at: string | null;
    error_message: string | null;
    approved_by: string | null;
    approved_at: string | null;
    rejected_by: string | null;
    rejected_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface ExecutionFilters {
    rule_id?: string;
    status?: string;
    requires_approval?: boolean;
    entity_type?: string;
    page?: number;
    limit?: number;
}

export interface CreateExecutionInput {
    rule_id: string;
    entity_type: string;
    entity_id: string;
    trigger_event_type?: string;
    requires_approval: boolean;
    trigger_data?: Record<string, any>;
}
