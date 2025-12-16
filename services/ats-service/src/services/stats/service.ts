import { AtsRepository } from '../../repository';

export class StatsService {
    constructor(private repository: AtsRepository) {}

    async getStats(): Promise<{
        totalJobs: number;
        activeJobs: number;
        totalApplications: number;
        totalPlacements: number
    }> {
        return await this.repository.getAtsStats();
    }
}
