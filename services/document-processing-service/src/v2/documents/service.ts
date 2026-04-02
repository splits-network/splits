import { DocumentRepositoryV2 } from './repository.js';
import { DocumentUpdate } from '../shared/types.js';

export class DocumentServiceV2 {
    constructor(
        private repository: DocumentRepositoryV2,
    ) { }

    async update(id: string, clerkUserId: string, updates: DocumentUpdate) {
        // Smart validation based on what's being updated
        if (updates.processing_status) {
            this.validateStatusTransition(updates.processing_status);
        }

        if (updates.scan_status) {
            this.validateScanStatusTransition(updates.scan_status);
        }

        return await this.repository.update(id, clerkUserId, updates);
    }

    // System-level update for processing service
    async updateBySystem(id: string, updates: DocumentUpdate) {
        if (updates.processing_status) {
            this.validateStatusTransition(updates.processing_status);
        }

        if (updates.scan_status) {
            this.validateScanStatusTransition(updates.scan_status);
        }

        return await this.repository.updateBySystem(id, updates);
    }

    private validateStatusTransition(status: string) {
        const validStatuses = ['pending', 'processing', 'processed', 'failed', 'enriching'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid processing status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }
    }

    private validateScanStatusTransition(status: string) {
        const validStatuses = ['pending', 'clean', 'infected', 'error'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid scan status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }
    }
}