import { AdminBillingRepository, AdminListParams, AdminListResponse } from './repository';

export class AdminBillingService {
    constructor(private repository: AdminBillingRepository) {}

    listPayoutsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listPayoutsAdmin(params);
    }

    listEscrowHoldsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listEscrowHoldsAdmin(params);
    }

    listBillingProfilesAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listBillingProfilesAdmin(params);
    }

    getAdminCounts(): Promise<{
        payouts_pending: number;
        escrow_active: number;
        billing_profiles: number;
    }> {
        return this.repository.getAdminCounts();
    }
}
