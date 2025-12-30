import { buildPaginationResponse } from '../shared/helpers';
import { RuleFilters, RuleUpdate } from './types';
import { AutomationRuleRepository, CreateRuleInput } from './repository';
import { EventPublisher } from '../shared/events';

export class AutomationRuleServiceV2 {
    constructor(
        private repository: AutomationRuleRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async listRules(filters: RuleFilters) {
        const result = await this.repository.findRules(filters);
        return {
            data: result.data,
            pagination: buildPaginationResponse(
                filters.page ?? 1,
                filters.limit ?? 25,
                result.total
            ),
        };
    }

    async getRule(id: string) {
        const rule = await this.repository.findRule(id);
        if (!rule) {
            throw new Error('Automation rule not found');
        }
        return rule;
    }

    async createRule(input: CreateRuleInput) {
        const rule = await this.repository.createRule(input);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.rules.created', {
                rule_id: rule.id,
                trigger_type: rule.trigger_type,
            });
        }
        return rule;
    }

    async updateRule(id: string, updates: RuleUpdate) {
        await this.getRule(id);
        const rule = await this.repository.updateRule(id, updates);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.rules.updated', {
                rule_id: id,
                updates,
            });
        }
        return rule;
    }

    async deleteRule(id: string) {
        await this.getRule(id);
        await this.repository.deleteRule(id);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.rules.deleted', {
                rule_id: id,
            });
        }
    }
}
