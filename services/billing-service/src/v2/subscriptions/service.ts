import { EventPublisher } from '../shared/events';
import { buildPaginationResponse, isBillingAdmin } from '../shared/helpers';
import type { AccessContext } from '../shared/access';
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
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: EventPublisher
    ) { }

    async getSubscriptions(
        filters: SubscriptionListFilters = {},
        clerkUserId: string
    ): Promise<{
        data: any[];
        pagination: ReturnType<typeof buildPaginationResponse>;
    }> {
        const access = await this.resolveAccessContext(clerkUserId);
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;

        const effectiveFilters = { ...filters };
        if (!isBillingAdmin(access)) {
            if (!access.identityUserId) {
                return {
                    data: [],
                    pagination: buildPaginationResponse(page, limit, 0),
                };
            }
            effectiveFilters.user_id = access.identityUserId;
        }

        const { data, total } = await this.repository.listSubscriptions(effectiveFilters);
        return {
            data,
            pagination: buildPaginationResponse(page, limit, total),
        };
    }

    async getSubscription(id: string, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        const subscription = await this.repository.findSubscription(id);
        if (!subscription) {
            throw new Error(`Subscription ${id} not found`);
        }

        if (!isBillingAdmin(access)) {
            if (!access.identityUserId || subscription.user_id !== access.identityUserId) {
                throw new Error('Not authorized to view this subscription');
            }
        }

        return subscription;
    }

    async getSubscriptionByClerkId(clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.identityUserId) {
            throw new Error('Unable to resolve user for subscription');
        }

        const subscription = await this.repository.findByUserId(access.identityUserId);
        if (!subscription) {
            throw new Error('No active subscription found');
        }

        return subscription;
    }

    async createSubscription(payload: SubscriptionCreateInput, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        const admin = isBillingAdmin(access);

        if (!payload.plan_id) {
            throw new Error('plan_id is required');
        }

        if (!admin) {
            if (!access.identityUserId) {
                throw new Error('Unable to resolve user for subscription');
            }
            payload.user_id = access.identityUserId;
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

        await this.publishEvent('subscription.created', subscription);
        return subscription;
    }

    async updateSubscription(
        id: string,
        updates: SubscriptionUpdateInput,
        clerkUserId: string
    ): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        const admin = isBillingAdmin(access);
        const subscription = await this.repository.findSubscription(id);

        if (!subscription) {
            throw new Error(`Subscription ${id} not found`);
        }

        if (!admin) {
            if (!access.identityUserId || subscription.user_id !== access.identityUserId) {
                throw new Error('Not authorized to update this subscription');
            }
            if (updates.status) {
                throw new Error('Status changes require billing admin role');
            }
        }

        const updated = await this.repository.updateSubscription(id, updates);
        await this.publishEvent('subscription.updated', {
            id: updated.id,
            changes: updates,
        });

        return updated;
    }

    async cancelSubscription(id: string, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        const admin = isBillingAdmin(access);
        const subscription = await this.repository.findSubscription(id);

        if (!subscription) {
            throw new Error(`Subscription ${id} not found`);
        }

        if (!admin) {
            if (!access.identityUserId || subscription.user_id !== access.identityUserId) {
                throw new Error('Not authorized to cancel this subscription');
            }
        }

        const updated = await this.repository.updateSubscription(id, {
            status: 'canceled',
            cancel_at: new Date().toISOString(),
            canceled_at: new Date().toISOString(),
        } as SubscriptionUpdateInput);

        await this.publishEvent('subscription.canceled', {
            id: updated.id,
        });

        return updated;
    }

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}
