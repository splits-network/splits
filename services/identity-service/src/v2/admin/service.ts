import { AdminIdentityRepository, AdminListParams, AdminListResponse } from './repository.js';
import { AdminStatsResult, getIdentityAdminStats } from './stats-repository.js';
import { AdminChartDataResult, getIdentityAdminChartData } from './chart-repository.js';

export class AdminIdentityService {
    constructor(private repository: AdminIdentityRepository) {}

    listUsersAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listUsersAdmin(params);
    }

    getUserAdmin(id: string): Promise<any> {
        return this.repository.getUserAdmin(id);
    }

    listOrganizationsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listOrganizationsAdmin(params);
    }

    getAdminCounts(): Promise<{ users: number; organizations: number }> {
        return this.repository.getAdminCounts();
    }

    getAdminActivity(params: { scope?: string; limit?: number }): Promise<any[]> {
        return this.repository.getAdminActivity(params);
    }

    getAdminStats(period: string): Promise<AdminStatsResult> {
        return getIdentityAdminStats(this.repository.getSupabase(), period);
    }

    getAdminChartData(period: string): Promise<AdminChartDataResult> {
        return getIdentityAdminChartData(this.repository.getSupabase(), period);
    }
}
