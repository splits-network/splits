import { IEventPublisher } from '../shared/events.js';
import { buildPaginationResponse, requireBillingAdmin } from '../shared/helpers.js';
import type { AccessContext } from '../shared/access.js';
import { PlanRepository } from './repository.js';
import { Plan, PlanCreateInput, PlanListFilters, PlanUpdateInput } from './types.js';
import type { SplitsRateService } from '../splits-rates/service.js';

export class PlanServiceV2 {
    private splitsRateService?: SplitsRateService;

    constructor(
        private repository: PlanRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: IEventPublisher
    ) {}

    /** Inject splits rate service for enriching plan responses */
    setSplitsRateService(service: SplitsRateService) {
        this.splitsRateService = service;
    }

    async getPlans(filters: PlanListFilters = {}): Promise<{
        data: (Plan & { splits_rate?: any })[];
        pagination: ReturnType<typeof buildPaginationResponse>;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const { data, total } = await this.repository.listPlans(filters);

        // Enrich plans with active splits rates
        let enrichedData = data as (Plan & { splits_rate?: any })[];
        if (this.splitsRateService) {
            try {
                const activeRates = await this.splitsRateService.getActiveRates();
                const ratesByPlanId = new Map(activeRates.map(r => [r.plan_id, r]));

                enrichedData = data.map(plan => ({
                    ...plan,
                    splits_rate: ratesByPlanId.get(plan.id) || null,
                }));
            } catch {
                // If rates fail to load, return plans without rates
            }
        }

        return {
            data: enrichedData,
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

    async createPlan(payload: PlanCreateInput, clerkUserId: string): Promise<Plan> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);

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

        await this.publishEvent('plan.created', plan);
        return plan;
    }

    async updatePlan(id: string, updates: PlanUpdateInput, clerkUserId: string): Promise<Plan> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        await this.getPlan(id);

        const plan = await this.repository.updatePlan(id, updates);
        await this.publishEvent('plan.updated', {
            id: plan.id,
            changes: updates,
        });

        return plan;
    }

    async deletePlan(id: string, clerkUserId: string): Promise<void> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        await this.getPlan(id);
        const archived = await this.repository.archivePlan(id);
        await this.publishEvent('plan.archived', {
            id: archived.id,
        });
    }

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}
