/**
 * Rule Engine - Evaluates automation rule conditions and executes actions
 *
 * Supports basic condition operators for v1:
 * - equals, not_equals: exact match
 * - contains: substring/array contains
 * - gt, gte, lt, lte: numeric comparisons
 * - in: value in list
 * - exists: field exists and is truthy
 */

import { Logger } from '@splits-network/shared-logging';

export interface ConditionClause {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'exists';
    value?: any;
}

export interface TriggerConditions {
    event_type?: string;
    all?: ConditionClause[];
    any?: ConditionClause[];
}

function getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

function evaluateClause(clause: ConditionClause, payload: Record<string, any>): boolean {
    const fieldValue = getNestedValue(payload, clause.field);

    switch (clause.operator) {
        case 'equals':
            return fieldValue === clause.value;
        case 'not_equals':
            return fieldValue !== clause.value;
        case 'contains':
            if (Array.isArray(fieldValue)) return fieldValue.includes(clause.value);
            if (typeof fieldValue === 'string') return fieldValue.includes(String(clause.value));
            return false;
        case 'gt':
            return Number(fieldValue) > Number(clause.value);
        case 'gte':
            return Number(fieldValue) >= Number(clause.value);
        case 'lt':
            return Number(fieldValue) < Number(clause.value);
        case 'lte':
            return Number(fieldValue) <= Number(clause.value);
        case 'in':
            return Array.isArray(clause.value) && clause.value.includes(fieldValue);
        case 'exists':
            return fieldValue != null && fieldValue !== '';
        default:
            return false;
    }
}

/**
 * Evaluate whether an event matches a rule's trigger conditions.
 */
export function evaluateConditions(
    conditions: TriggerConditions,
    eventType: string,
    eventPayload: Record<string, any>,
): boolean {
    // Check event type filter first
    if (conditions.event_type && conditions.event_type !== eventType) {
        return false;
    }

    // ALL conditions must match (AND)
    if (conditions.all && conditions.all.length > 0) {
        const allMatch = conditions.all.every(clause => evaluateClause(clause, eventPayload));
        if (!allMatch) return false;
    }

    // ANY conditions must have at least one match (OR)
    if (conditions.any && conditions.any.length > 0) {
        const anyMatch = conditions.any.some(clause => evaluateClause(clause, eventPayload));
        if (!anyMatch) return false;
    }

    return true;
}

export interface ActionResult {
    success: boolean;
    output?: Record<string, any>;
    error?: string;
}

/**
 * Execute a rule's actions. For v1, actions are descriptive and stored
 * as output data. Complex action execution (DB mutations, API calls)
 * will be added in v2.
 */
export async function executeAction(
    actions: Record<string, any>,
    entityType: string,
    entityId: string,
    logger: Logger,
): Promise<ActionResult> {
    try {
        logger.info(
            { actionType: actions.type, entityType, entityId },
            'Executing automation action',
        );

        // For v1, we record the action as executed.
        // Future: implement action types like update_stage, create_fraud_signal, send_notification
        return {
            success: true,
            output: {
                action_type: actions.type || 'recorded',
                entity_type: entityType,
                entity_id: entityId,
                executed_at: new Date().toISOString(),
                action_config: actions,
            },
        };
    } catch (error: any) {
        logger.error({ error, entityType, entityId }, 'Failed to execute automation action');
        return {
            success: false,
            error: error.message || 'Action execution failed',
        };
    }
}
