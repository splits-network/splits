import { buildPaginationResponse } from '../shared/helpers';
import { FraudSignalFilters, FraudSignalUpdate } from './types';
import { CreateFraudSignalInput, FraudSignalRepository } from './repository';
import { IEventPublisher } from '../shared/events';
import type { AccessContext } from '../shared/access';

export class FraudSignalServiceV2 {
    constructor(
        private repository: FraudSignalRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: IEventPublisher
    ) {}

    private async requirePlatformAdmin(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            throw new Error('Platform admin permissions required');
        }
        return access;
    }

    async listSignals(clerkUserId: string, filters: FraudSignalFilters) {
        await this.requirePlatformAdmin(clerkUserId);
        const result = await this.repository.findSignals(filters);
        return {
            data: result.data,
            pagination: buildPaginationResponse(
                filters.page ?? 1,
                filters.limit ?? 25,
                result.total
            ),
        };
    }

    async getSignal(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        const signal = await this.repository.findSignal(id);
        if (!signal) {
            throw new Error('Fraud signal not found');
        }
        return signal;
    }

    async createSignal(clerkUserId: string, input: CreateFraudSignalInput) {
        await this.requirePlatformAdmin(clerkUserId);
        const signal = await this.repository.createSignal(input);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.fraud.created', {
                signal_id: signal.id,
                entity_type: signal.entity_type,
                entity_id: signal.entity_id,
                severity: signal.severity,
            });
        }
        return signal;
    }

    async updateSignal(clerkUserId: string, id: string, updates: FraudSignalUpdate) {
        await this.requirePlatformAdmin(clerkUserId);
        await this.getSignal(clerkUserId, id);
        const signal = await this.repository.updateSignal(id, updates);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.fraud.updated', {
                signal_id: id,
                updates,
            });
        }
        return signal;
    }

    async deleteSignal(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        await this.getSignal(clerkUserId, id);
        await this.repository.deleteSignal(id);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.fraud.deleted', {
                signal_id: id,
            });
        }
    }
}
