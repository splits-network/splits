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

export class AdminNetworkRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' },
        });
    }

    async listRecruitersAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('recruiters')
            .select('*, user:users!recruiters_user_id_fkey(name, email)', { count: 'exact' });

        if (params.search) {
            query = query.or(`tagline.ilike.%${params.search}%,bio.ilike.%${params.search}%`);
        }

        if (params.status) {
            query = query.eq('status', params.status);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async updateRecruiterStatusAdmin(id: string, status: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('recruiters')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async listRecruiterCompaniesAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('recruiter_companies')
            .select(
                '*, company:companies!recruiter_companies_company_id_fkey(id, name, logo_url), recruiter:recruiters!recruiter_companies_recruiter_id_fkey(id, user:users!recruiters_user_id_fkey(name, email))',
                { count: 'exact' },
            );

        if (params.status) {
            query = query.eq('status', params.status);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async listFirmsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('firms')
            .select('*, owner:users!firms_owner_user_id_fkey(name, email)', { count: 'exact' });

        if (params.search) {
            query = query.ilike('name', `%${params.search}%`);
        }

        if (params.status) {
            query = query.eq('status', params.status);
        }

        if (params.marketplace_status === 'pending_approval') {
            query = query.eq('marketplace_visible', true).is('marketplace_approved_at', null);
        } else if (params.marketplace_status === 'approved') {
            query = query.not('marketplace_approved_at', 'is', null);
        } else if (params.marketplace_status === 'not_listed') {
            query = query.eq('marketplace_visible', false);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async updateFirmMarketplaceApproval(firmId: string, approved: boolean): Promise<any> {
        const { data, error } = await this.supabase
            .from('firms')
            .update({
                marketplace_approved_at: approved ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', firmId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getAdminCounts(): Promise<{
        recruiters: number;
        recruiters_pending: number;
        recruiter_companies: number;
        firms: number;
        firms_pending_approval: number;
        firms_marketplace_active: number;
    }> {
        const [recruitersRes, pendingRes, companiesRes, firmsRes, firmsPendingRes, firmsActiveRes] = await Promise.all([
            this.supabase.from('recruiters').select('id', { count: 'exact', head: true }),
            this.supabase
                .from('recruiters')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'pending'),
            this.supabase.from('recruiter_companies').select('id', { count: 'exact', head: true }),
            this.supabase.from('firms').select('id', { count: 'exact', head: true }),
            this.supabase
                .from('firms')
                .select('id', { count: 'exact', head: true })
                .eq('marketplace_visible', true)
                .is('marketplace_approved_at', null),
            this.supabase
                .from('firms')
                .select('id', { count: 'exact', head: true })
                .not('marketplace_approved_at', 'is', null),
        ]);

        return {
            recruiters: recruitersRes.count || 0,
            recruiters_pending: pendingRes.count || 0,
            recruiter_companies: companiesRes.count || 0,
            firms: firmsRes.count || 0,
            firms_pending_approval: firmsPendingRes.count || 0,
            firms_marketplace_active: firmsActiveRes.count || 0,
        };
    }

    private async countRecruiters(from?: string, to?: string, status?: string): Promise<number> {
        let q = this.supabase.from('recruiters').select('id', { count: 'exact', head: true });
        if (from) q = q.gte('created_at', from);
        if (to) q = q.lt('created_at', to);
        if (status) q = q.eq('status', status);
        const { count } = await q;
        return count || 0;
    }

    async getAdminStats(period: string): Promise<{
        recruiters: { sparkline: number[]; trend: number; total: number };
        recruiterStatus: { label: string; value: number }[];
    }> {
        const DAY = 86_400_000;
        const periodConfigMap: Record<string, { buckets: number; bucketMs: number; periodMs: number }> = {
            '7d': { buckets: 7, bucketMs: DAY, periodMs: 7 * DAY },
            '90d': { buckets: 10, bucketMs: 9 * DAY, periodMs: 90 * DAY },
            '1y': { buckets: 12, bucketMs: 30 * DAY, periodMs: 365 * DAY },
            'all': { buckets: 10, bucketMs: 0, periodMs: 0 },
        };
        const config = periodConfigMap[period] ?? { buckets: 10, bucketMs: 3 * DAY, periodMs: 30 * DAY };
        const now = Date.now();

        const statusCountPromises = ['active', 'pending', 'suspended', 'inactive'].map(async s => ({
            label: s,
            value: await this.countRecruiters(undefined, undefined, s),
        }));

        if (period === 'all') {
            const [total, recruiterStatus] = await Promise.all([
                this.countRecruiters(),
                Promise.all(statusCountPromises),
            ]);
            const sparkline = Array(config.buckets).fill(Math.floor(total / config.buckets));
            return { recruiters: { sparkline, trend: 0, total }, recruiterStatus };
        }

        const periodStart = new Date(now - config.periodMs).toISOString();
        const prevPeriodStart = new Date(now - config.periodMs * 2).toISOString();

        const bucketCountPromises = Array.from({ length: config.buckets }, (_, i) => {
            const start = new Date(now - config.periodMs + i * config.bucketMs).toISOString();
            const end = new Date(Math.min(now, now - config.periodMs + (i + 1) * config.bucketMs)).toISOString();
            return this.countRecruiters(start, end);
        });

        const [sparkline, prevCount, total, recruiterStatus] = await Promise.all([
            Promise.all(bucketCountPromises),
            this.countRecruiters(prevPeriodStart, periodStart),
            this.countRecruiters(),
            Promise.all(statusCountPromises),
        ]);

        const currentTotal = sparkline.reduce((a, b) => a + b, 0);
        const trend = prevCount === 0
            ? (currentTotal > 0 ? 100 : 0)
            : Math.round(((currentTotal - prevCount) / prevCount) * 100);

        return {
            recruiters: { sparkline, trend, total },
            recruiterStatus,
        };
    }
}
