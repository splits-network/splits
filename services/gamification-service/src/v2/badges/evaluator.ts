/**
 * Badge Evaluator - evaluates badge criteria against entity data
 * Reuses the condition clause pattern from automation-service rule-engine
 */

export interface ConditionClause {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'exists';
    value?: any;
}

export interface BadgeCriteria {
    all?: ConditionClause[];
    any?: ConditionClause[];
}

function getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

function evaluateClause(clause: ConditionClause, data: Record<string, any>): boolean {
    const fieldValue = getNestedValue(data, clause.field);

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
 * Evaluate whether entity data matches badge criteria.
 */
export function evaluateBadgeCriteria(
    criteria: BadgeCriteria,
    entityData: Record<string, any>
): boolean {
    if (criteria.all && criteria.all.length > 0) {
        const allMatch = criteria.all.every(clause => evaluateClause(clause, entityData));
        if (!allMatch) return false;
    }

    if (criteria.any && criteria.any.length > 0) {
        const anyMatch = criteria.any.some(clause => evaluateClause(clause, entityData));
        if (!anyMatch) return false;
    }

    return true;
}
