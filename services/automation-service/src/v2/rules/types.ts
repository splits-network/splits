/**
 * Automation Rule Domain Types
 */

export interface AutomationRule {
    id: string;
    name: string;
    description: string | null;
    trigger_type: string;
    condition: Record<string, any>;
    action: Record<string, any>;
    status: 'active' | 'inactive' | 'archived';
    requires_approval: boolean;
    created_at: string;
    updated_at: string;
}

export interface RuleFilters {
    trigger_type?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export type RuleUpdate = Partial<Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>>;
