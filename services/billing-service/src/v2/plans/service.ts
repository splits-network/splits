import { EventPublisher } from '../shared/events';
import { buildPaginationResponse, UserContext, requireBillingAdmin } from '../shared/helpers';
import { PlanRepository } from './repository';
import { Plan, PlanCreateInput, PlanListFilters, PlanUpdateInput } from './types';

export class PlanServiceV2 {
    constructor(
        private repository: PlanRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async getPlans(filters: PlanListFilters = {}): Promise<{
        data: Plan[];
        pagination: ReturnType<typeof buildPaginationResponse>;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const { data, total } = await this.repository.listPlans(filters);

        return {
            data,
            pagination: buildPaginationResponse(page, limit, total),
        };
    }

    async getPlan(id: string): Promise<Plan> {
        const plan = await this.repository.findPlan(id);
        if (!plan) {
            throw new Error(`Plan ${id} not found`);
        }
        return plan;
    }

    async createPlan(payload: PlanCreateInput, context: UserContext): Promise<Plan> {
        requireBillingAdmin(context);

        if (!payload.name) {
            throw new Error('Plan name is required');
        }
        if (!payload.slug) {
            throw new Error('Plan slug is required');
        }
        if (!payload.price_cents || payload.price_cents <= 0) {
            throw new Error('price_cents must be greater than zero');
        }

        const plan = await this.repository.createPlan({
            ...payload,
            status: payload.status || 'active',
        });

        await this.publishEvent('billing.plan.created', plan);
        return plan;
    }

    async updatePlan(id: string, updates: PlanUpdateInput, context: UserContext): Promise<Plan> {
        requireBillingAdmin(context);
        await this.getPlan(id);

        const plan = await this.repository.updatePlan(id, updates);
        await this.publishEvent('billing.plan.updated', {
            id: plan.id,
            changes: updates,
        });

        return plan;
    }

    async deletePlan(id: string, context: UserContext): Promise<void> {
        requireBillingAdmin(context);
        await this.getPlan(id);
        const archived = await this.repository.archivePlan(id);
        await this.publishEvent('billing.plan.archived', {
            id: archived.id,
        });
    }

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}
