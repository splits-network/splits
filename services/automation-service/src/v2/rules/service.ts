import { buildPaginationResponse } from '../shared/helpers';
import { RuleFilters, RuleUpdate } from './types';
import { AutomationRuleRepository, CreateRuleInput } from './repository';
import { EventPublisher } from '../shared/events';
import type { AccessContext } from '../shared/access';

export class AutomationRuleServiceV2 {
    constructor(
        private repository: AutomationRuleRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: EventPublisher
    ) {}

    private async requirePlatformAdmin(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            throw new Error('Platform admin permissions required');
        }
        return access;
    }

    async listRules(clerkUserId: string, filters: RuleFilters) {
        await this.requirePlatformAdmin(clerkUserId);
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

    async getRule(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        const rule = await this.repository.findRule(id);
        if (!rule) {
            throw new Error('Automation rule not found');
        }
        return rule;
    }

    async createRule(clerkUserId: string, input: CreateRuleInput) {
        await this.requirePlatformAdmin(clerkUserId);
        const rule = await this.repository.createRule(input);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.rules.created', {
                rule_id: rule.id,
                trigger_type: rule.trigger_type,
            });
        }
        return rule;
    }

    async updateRule(clerkUserId: string, id: string, updates: RuleUpdate) {
        await this.requirePlatformAdmin(clerkUserId);
        await this.getRule(clerkUserId, id);
        const rule = await this.repository.updateRule(id, updates);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.rules.updated', {
                rule_id: id,
                updates,
            });
        }
        return rule;
    }

    async deleteRule(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        await this.getRule(clerkUserId, id);
        await this.repository.deleteRule(id);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.rules.deleted', {
                rule_id: id,
            });
        }
    }
}
