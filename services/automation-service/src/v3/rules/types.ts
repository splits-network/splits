/**
 * Automation Rules V3 Types & JSON Schemas
 */

export interface RuleListParams {
  page?: number;
  limit?: number;
  rule_type?: string;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateRuleInput {
  name: string;
  description?: string;
  rule_type: string;
  trigger_conditions: Record<string, any>;
  actions: Record<string, any>;
  requires_human_approval?: boolean;
  max_executions_per_day?: number;
}

export interface UpdateRuleInput {
  name?: string;
  description?: string;
  status?: 'active' | 'paused' | 'disabled';
  trigger_conditions?: Record<string, any>;
  actions?: Record<string, any>;
  requires_human_approval?: boolean;
  max_executions_per_day?: number;
}

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    rule_type: { type: 'string' },
    status: { type: 'string', enum: ['active', 'paused', 'disabled'] },
    sort_by: { type: 'string', enum: ['created_at', 'name', 'status'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export const createRuleSchema = {
  type: 'object',
  required: ['name', 'rule_type', 'trigger_conditions', 'actions'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string', maxLength: 1000 },
    rule_type: { type: 'string', minLength: 1 },
    trigger_conditions: { type: 'object' },
    actions: { type: 'object' },
    requires_human_approval: { type: 'boolean' },
    max_executions_per_day: { type: 'integer', minimum: 1 },
  },
  additionalProperties: false,
};

export const updateRuleSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string', maxLength: 1000 },
    status: { type: 'string', enum: ['active', 'paused', 'disabled'] },
    trigger_conditions: { type: 'object' },
    actions: { type: 'object' },
    requires_human_approval: { type: 'boolean' },
    max_executions_per_day: { type: 'integer', minimum: 1 },
  },
  additionalProperties: false,
};
