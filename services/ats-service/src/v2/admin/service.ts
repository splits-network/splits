import { AdminAtsRepository, AdminListParams, AdminListResponse } from './repository';
import { AdminAtsStatsResult, getAtsAdminStats } from './stats-repository';
import { AdminAtsChartDataResult, getAtsAdminChartData } from './chart-repository';

export class AdminAtsService {
    constructor(private repository: AdminAtsRepository) {}

    listJobsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listJobsAdmin(params);
    }

    getJobAdmin(id: string): Promise<any> {
        return this.repository.getJobAdmin(id);
    }

    listApplicationsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listApplicationsAdmin(params);
    }

    listCandidatesAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listCandidatesAdmin(params);
    }

    listAssignmentsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listAssignmentsAdmin(params);
    }

    listPlacementsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listPlacementsAdmin(params);
    }

    updateJobStatusAdmin(id: string, status: string): Promise<any> {
        return this.repository.updateJobStatusAdmin(id, status);
    }

    getJobCountsByStatus(): Promise<Record<string, number>> {
        return this.repository.getJobCountsByStatus();
    }

    getAdminCounts(): Promise<{
        jobs: number;
        applications: number;
        candidates: number;
        assignments: number;
        placements: number;
    }> {
        return this.repository.getAdminCounts();
    }

    getAdminStats(period: string): Promise<AdminAtsStatsResult> {
        return getAtsAdminStats(this.repository.getSupabase(), period);
    }

    getAdminChartData(period: string): Promise<AdminAtsChartDataResult> {
        return getAtsAdminChartData(this.repository.getSupabase(), period);
    }
}
