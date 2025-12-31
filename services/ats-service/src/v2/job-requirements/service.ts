import { JobRequirementRepository } from './repository';

export class JobRequirementService {
    constructor(private repository: JobRequirementRepository) {}

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
}
