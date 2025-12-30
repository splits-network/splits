import { buildPaginationResponse } from '../shared/helpers';
import { FraudSignalFilters, FraudSignalUpdate } from '../types';
import { CreateFraudSignalInput, FraudSignalRepository } from './repository';
import { EventPublisher } from '../shared/events';

export class FraudSignalServiceV2 {
    constructor(
        private repository: FraudSignalRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async listSignals(filters: FraudSignalFilters) {
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

    async getSignal(id: string) {
        const signal = await this.repository.findSignal(id);
        if (!signal) {
            throw new Error('Fraud signal not found');
        }
        return signal;
    }

    async createSignal(input: CreateFraudSignalInput) {
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

    async updateSignal(id: string, updates: FraudSignalUpdate) {
        await this.getSignal(id);
        const signal = await this.repository.updateSignal(id, updates);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.fraud.updated', {
                signal_id: id,
                updates,
            });
        }
        return signal;
    }

    async deleteSignal(id: string) {
        await this.getSignal(id);
        await this.repository.deleteSignal(id);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.fraud.deleted', {
                signal_id: id,
            });
        }
    }
}
