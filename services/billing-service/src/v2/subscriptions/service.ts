import { EventPublisher } from '../shared/events';
import {
    buildPaginationResponse,
    UserContext,
    isBillingAdmin,
} from '../shared/helpers';
import { PlanRepository } from '../plans/repository';
import { SubscriptionRepository } from './repository';
import {
    SubscriptionCreateInput,
    SubscriptionListFilters,
    SubscriptionUpdateInput,
} from './types';

export class SubscriptionServiceV2 {
    constructor(
        private repository: SubscriptionRepository,
        private planRepository: PlanRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async getSubscriptions(
        filters: SubscriptionListFilters = {},
        context: UserContext
    ): Promise<{
        data: any[];
        pagination: ReturnType<typeof buildPaginationResponse>;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;

        const effectiveFilters = { ...filters };
        if (!isBillingAdmin(context.role)) {
            effectiveFilters.user_id = context.userId;
        }

        const { data, total } = await this.repository.listSubscriptions(effectiveFilters);
        return {
            data,
            pagination: buildPaginationResponse(page, limit, total),
        };
    }

    async getSubscription(id: string, context: UserContext): Promise<any> {
        const subscription = await this.repository.findSubscription(id);
        if (!subscription) {
            throw new Error(`Subscription ${id} not found`);
        }

        if (!isBillingAdmin(context.role) && subscription.user_id !== context.userId) {
            throw new Error('Not authorized to view this subscription');
        }

        return subscription;
    }

    async createSubscription(payload: SubscriptionCreateInput, context: UserContext): Promise<any> {
        if (!payload.plan_id) {
            throw new Error('plan_id is required');
        }

        if (!isBillingAdmin(context.role)) {
            payload.user_id = context.userId;
        } else if (!payload.user_id) {
            throw new Error('user_id is required');
        }

        const plan = await this.planRepository.findPlan(payload.plan_id);
        if (!plan) {
            throw new Error('Plan not found');
        }

        const subscription = await this.repository.createSubscription({
            ...payload,
            status: payload.status || 'active',
            current_period_start: payload.current_period_start || new Date().toISOString(),
        });

        await this.publishEvent('billing.subscription.created', subscription);
        return subscription;
    }

    async updateSubscription(
        id: string,
        updates: SubscriptionUpdateInput,
        context: UserContext
    ): Promise<any> {
        const subscription = await this.getSubscription(id, context);

        if (!isBillingAdmin(context.role) && updates.status) {
            throw new Error('Status changes require billing admin role');
        }

        const updated = await this.repository.updateSubscription(id, updates);
        await this.publishEvent('billing.subscription.updated', {
            id: updated.id,
            changes: updates,
        });

        return updated;
    }

    async cancelSubscription(id: string, context: UserContext): Promise<any> {
        const subscription = await this.getSubscription(id, context);

        if (!isBillingAdmin(context.role) && subscription.user_id !== context.userId) {
            throw new Error('Not authorized to cancel this subscription');
        }

        const updated = await this.repository.updateSubscription(id, {
            status: 'canceled',
            cancel_at: new Date().toISOString(),
            canceled_at: new Date().toISOString(),
        } as SubscriptionUpdateInput);

        await this.publishEvent('billing.subscription.canceled', {
            id: updated.id,
        });

        return updated;
    }

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}