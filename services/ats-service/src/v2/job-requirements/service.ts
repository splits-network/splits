import { JobRequirementRepository } from './repository';
import { JobRequirementBulkItem } from '../types';

export class JobRequirementService {
    constructor(private repository: JobRequirementRepository) { }

    async listRequirements(jobId?: string) {
        return this.repository.list(jobId);
    }

    async getRequirement(id: string) {
        return this.repository.getById(id);
    }

    async createRequirement(payload: any) {
        return this.repository.createRequirement(payload);
    }

    async updateRequirement(id: string, payload: any) {
        return this.repository.updateRequirement(id, payload);
    }

    async deleteRequirement(id: string) {
        await this.repository.deleteRequirement(id);
    }

    /**
     * Bulk replace all requirements for a job
     * Validates input and delegates to repository for atomic operation
     */
    async bulkReplaceByJob(jobId: string, requirements: JobRequirementBulkItem[]) {
        // Validate job_id
        if (!jobId) {
            throw new Error('job_id is required');
        }

        // Validate requirements array
        if (!Array.isArray(requirements)) {
            throw new Error('requirements must be an array');
        }

        // Validate each requirement object
        for (let i = 0; i < requirements.length; i++) {
            const requirement = requirements[i];
            if (!requirement.requirement_type) {
                throw new Error(`Requirement ${i + 1}: requirement_type is required`);
            }
            if (!requirement.description) {
                throw new Error(`Requirement ${i + 1}: description is required`);
            }
            if (requirement.sort_order === undefined || requirement.sort_order === null) {
                throw new Error(`Requirement ${i + 1}: sort_order is required`);
            }
        }

        return this.repository.bulkReplaceByJob(jobId, requirements);
    }
}
