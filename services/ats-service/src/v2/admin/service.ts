import { AdminAtsRepository, AdminListParams, AdminListResponse } from './repository';

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

    getAdminCounts(): Promise<{
        jobs: number;
        applications: number;
        candidates: number;
        assignments: number;
        placements: number;
    }> {
        return this.repository.getAdminCounts();
    }
}
