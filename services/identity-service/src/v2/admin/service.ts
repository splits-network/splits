import { AdminIdentityRepository, AdminListParams, AdminListResponse } from './repository';

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
}
