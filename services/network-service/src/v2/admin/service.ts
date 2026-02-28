import { AdminNetworkRepository, AdminListParams, AdminListResponse } from './repository';

export class AdminNetworkService {
    constructor(private repository: AdminNetworkRepository) {}

    listRecruitersAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listRecruitersAdmin(params);
    }

    updateRecruiterStatusAdmin(id: string, status: string): Promise<any> {
        return this.repository.updateRecruiterStatusAdmin(id, status);
    }

    listRecruiterCompaniesAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listRecruiterCompaniesAdmin(params);
    }

    getAdminCounts(): Promise<{
        recruiters: number;
        recruiters_pending: number;
        recruiter_companies: number;
    }> {
        return this.repository.getAdminCounts();
    }

    getAdminStats(period: string): Promise<{
        recruiters: { sparkline: number[]; trend: number; total: number };
        recruiterStatus: { label: string; value: number }[];
    }> {
        return this.repository.getAdminStats(period);
    }
}
