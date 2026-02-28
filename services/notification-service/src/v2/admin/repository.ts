import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AdminListParams {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    [key: string]: any;
}

export interface AdminListResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

function paginate(params: AdminListParams): { page: number; limit: number; offset: number } {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 25));
    return { page, limit, offset: (page - 1) * limit };
}

function buildPagination(total: number, page: number, limit: number) {
    return { total, page, limit, total_pages: Math.ceil(total / limit) };
}

export class AdminNotificationRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' },
        });
    }

    async listSiteNotificationsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('site_notifications')
            .select('*', { count: 'exact' });

        if (params.search) {
            query = query.or(`title.ilike.%${params.search}%,message.ilike.%${params.search}%`);
        }

        if (params.is_active !== undefined) {
            query = query.eq('is_active', params.is_active === 'true' || params.is_active === true);
        }

        if (params.severity) {
            query = query.eq('severity', params.severity);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async createSiteNotificationAdmin(data: Record<string, any>): Promise<any> {
        const { data: notification, error } = await this.supabase
            .from('site_notifications')
            .insert({
                type: data.type,
                severity: data.severity,
                source: 'admin',
                title: data.title,
                message: data.message || null,
                starts_at: data.starts_at || null,
                expires_at: data.expires_at || null,
                is_active: data.is_active !== undefined ? data.is_active : true,
                dismissible: data.dismissible !== undefined ? data.dismissible : true,
                created_by: data.created_by || null,
            })
            .select()
            .single();

        if (error) throw error;
        return notification;
    }

    async updateSiteNotificationAdmin(id: string, data: Record<string, any>): Promise<any> {
        const allowedFields = [
            'type', 'severity', 'title', 'message',
            'starts_at', 'expires_at', 'is_active', 'dismissible',
        ];
        const updates: Record<string, any> = { updated_at: new Date().toISOString() };
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates[field] = data[field];
            }
        }

        const { data: notification, error } = await this.supabase
            .from('site_notifications')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return notification;
    }

    async deleteSiteNotificationAdmin(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('site_notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async listNotificationLogAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('notification_log')
            .select('*', { count: 'exact' });

        if (params.search) {
            query = query.or(
                `recipient_email.ilike.%${params.search}%,event_type.ilike.%${params.search}%`
            );
        }

        if (params.status) {
            query = query.eq('status', params.status);
        }

        if (params.channel) {
            query = query.eq('channel', params.channel);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async getAdminCounts(): Promise<{
        active_site_notifications: number;
        notification_log_total: number;
    }> {
        const [activeRes, logRes] = await Promise.all([
            this.supabase
                .from('site_notifications')
                .select('id', { count: 'exact', head: true })
                .eq('is_active', true),
            this.supabase
                .from('notification_log')
                .select('id', { count: 'exact', head: true }),
        ]);

        return {
            active_site_notifications: activeRes.count || 0,
            notification_log_total: logRes.count || 0,
        };
    }
}
