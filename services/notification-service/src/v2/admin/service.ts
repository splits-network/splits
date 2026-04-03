import { AdminNotificationRepository, AdminListParams, AdminListResponse } from './repository.js';

export class AdminNotificationService {
    constructor(private repository: AdminNotificationRepository) {}

    listSiteNotificationsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listSiteNotificationsAdmin(params);
    }

    createSiteNotificationAdmin(data: Record<string, any>): Promise<any> {
        return this.repository.createSiteNotificationAdmin(data);
    }

    updateSiteNotificationAdmin(id: string, data: Record<string, any>): Promise<any> {
        return this.repository.updateSiteNotificationAdmin(id, data);
    }

    deleteSiteNotificationAdmin(id: string): Promise<void> {
        return this.repository.deleteSiteNotificationAdmin(id);
    }

    listNotificationLogAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        return this.repository.listNotificationLogAdmin(params);
    }

    getAdminCounts(): Promise<{
        active_site_notifications: number;
        notification_log_total: number;
    }> {
        return this.repository.getAdminCounts();
    }
}
