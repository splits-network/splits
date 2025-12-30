import { EventPublisher } from '../shared/events';
import {
    buildPaginationResponse,
    UserContext,
    requireBillingAdmin,
} from '../shared/helpers';
import { PayoutRepository } from './repository';
import { PayoutCreateInput, PayoutListFilters, PayoutUpdateInput } from './types';

export class PayoutServiceV2 {
    constructor(
        private repository: PayoutRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async getPayouts(
        filters: PayoutListFilters = {},
        context: UserContext
    ): Promise<{
        data: any[];
        pagination: ReturnType<typeof buildPaginationResponse>;
    }> {
        requireBillingAdmin(context);
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const { data, total } = await this.repository.listPayouts(filters);
        return {
            data,
            pagination: buildPaginationResponse(page, limit, total),
        };
    }

    async getPayout(id: string, context: UserContext): Promise<any> {
        requireBillingAdmin(context);
        const payout = await this.repository.findPayout(id);
        if (!payout) {
            throw new Error(`Payout ${id} not found`);
        }
        return payout;
    }

    async createPayout(payload: PayoutCreateInput, context: UserContext): Promise<any> {
        requireBillingAdmin(context);
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

        await this.publishEvent('billing.payout.created', payout);
        return payout;
    }

    async updatePayout(id: string, updates: PayoutUpdateInput, context: UserContext): Promise<any> {
        requireBillingAdmin(context);
        await this.getPayout(id, context);
        const updated = await this.repository.updatePayout(id, updates);
        await this.publishEvent('billing.payout.updated', {
            id: updated.id,
            changes: updates,
        });
        return updated;
    }

    async deletePayout(id: string, context: UserContext): Promise<void> {
        requireBillingAdmin(context);
        await this.getPayout(id, context);
        await this.repository.updatePayout(id, {
            status: 'failed',
        } as PayoutUpdateInput);
        await this.publishEvent('billing.payout.deleted', { id });
    }

    private async publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publish(eventType, payload);
    }
}