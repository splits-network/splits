import { NetworkRepository } from '../../repository';

/**
 * Stats Service
 * Handles service-wide statistics
 */
export class StatsService {
    constructor(private repository: NetworkRepository) {}

    async getStats(): Promise<{ totalRecruiters: number; activeRecruiters: number; pendingRecruiters: number }> {
        return await this.repository.getRecruiterStats();
    }
}
