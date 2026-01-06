import { EventPublisher } from '../shared/events';
import { buildPaginationResponse, requireBillingAdmin } from '../shared/helpers';
import type { AccessContext } from '../shared/access';
import { PayoutRepository } from './repository';
import { PayoutCreateInput, PayoutListFilters, PayoutUpdateInput } from './types';

export class PayoutServiceV2 {
    constructor(
        private repository: PayoutRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: EventPublisher
    ) {}

    async getPayouts(
        filters: PayoutListFilters = {},
        clerkUserId: string
    ): Promise<{
        data: any[];
        pagination: ReturnType<typeof buildPaginationResponse>;
    }> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const { data, total } = await this.repository.listPayouts(filters);
        return {
            data,
            pagination: buildPaginationResponse(page, limit, total),
        };
    }

    async getPayout(id: string, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        const payout = await this.repository.findPayout(id);
        if (!payout) {
            throw new Error(`Payout ${id} not found`);
        }
        return payout;
    }

    async createPayout(payload: PayoutCreateInput, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        if (!payload.recruiter_id) {
            throw new Error('recruiter_id is required');
        }
        if (payload.amount_cents <= 0) {
            throw new Error('amount_cents must be positive');
        }

        const payout = await this.repository.createPayout({
            ...payload,
            status: payload.status || 'pending',
        });

        await this.publishEvent('payout.created', payout);
        return payout;
    }

    async updatePayout(id: string, updates: PayoutUpdateInput, clerkUserId: string): Promise<any> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        await this.getPayout(id, clerkUserId);
        const updated = await this.repository.updatePayout(id, updates);
        await this.publishEvent('payout.updated', {
            id: updated.id,
            changes: updates,
        });
        return updated;
    }

    async deletePayout(id: string, clerkUserId: string): Promise<void> {
        const access = await this.resolveAccessContext(clerkUserId);
        requireBillingAdmin(access);
        await this.getPayout(id, clerkUserId);
        await this.repository.updatePayout(id, {
            status: 'failed',
        } as PayoutUpdateInput);
        await this.publishEvent('payout.deleted', { id });
    }

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}
