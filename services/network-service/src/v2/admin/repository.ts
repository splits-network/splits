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
            .select('*', { count: 'exact' });

        if (params.search) {
            query = query.or(`headline.ilike.%${params.search}%,bio.ilike.%${params.search}%`);
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
            .select('*', { count: 'exact' });

        if (params.status) {
            query = query.eq('status', params.status);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async getAdminCounts(): Promise<{
        recruiters: number;
        recruiters_pending: number;
        recruiter_companies: number;
    }> {
        const [recruitersRes, pendingRes, companiesRes] = await Promise.all([
            this.supabase.from('recruiters').select('id', { count: 'exact', head: true }),
            this.supabase
                .from('recruiters')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'pending'),
            this.supabase.from('recruiter_companies').select('id', { count: 'exact', head: true }),
        ]);

        return {
            recruiters: recruitersRes.count || 0,
            recruiters_pending: pendingRes.count || 0,
            recruiter_companies: companiesRes.count || 0,
        };
    }
}
