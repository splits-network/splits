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

export class AdminAtsRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' },
        });
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    async listJobsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('jobs')
            .select('*, company:companies(id, name, logo_url)', { count: 'exact' });

        if (params.search) {
            query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
        }

        if (params.status) {
            query = query.eq('status', params.status);
        }

        if (params.commute_type) {
            query = query.contains('commute_types', [params.commute_type]);
        }

        if (params.job_level) {
            query = query.eq('job_level', params.job_level);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async getJobAdmin(id: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('jobs')
            .select('*, company:companies(id, name, logo_url, industry)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async listApplicationsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('applications')
            .select(
                '*, job:jobs(id, title), candidate:candidates(id, full_name, email)',
                { count: 'exact' }
            );

        if (params.stage) {
            query = query.eq('stage', params.stage);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async listCandidatesAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('candidates')
            .select('*', { count: 'exact' });

        if (params.search) {
            query = query.or(
                `full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`
            );
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async listAssignmentsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'assigned_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('role_assignments')
            .select('*, job:jobs(id, title)', { count: 'exact' });

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async listPlacementsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('placements')
            .select('*', { count: 'exact' });

        if (params.state) {
            query = query.eq('state', params.state);
        }

        if (params.search) {
            query = query.or(
                `candidate_name.ilike.%${params.search}%,company_name.ilike.%${params.search}%`
            );
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async updateJobStatusAdmin(id: string, status: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('jobs')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getJobCountsByStatus(): Promise<Record<string, number>> {
        const statuses = ['draft', 'pending', 'early', 'active', 'priority', 'paused', 'filled', 'closed'];
        const results = await Promise.all(
            statuses.map((s) =>
                this.supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', s),
            ),
        );

        const counts: Record<string, number> = {};
        statuses.forEach((s, i) => {
            counts[s] = results[i].count || 0;
        });
        return counts;
    }

    async getAdminCounts(): Promise<{
        jobs: number;
        applications: number;
        candidates: number;
        assignments: number;
        placements: number;
    }> {
        const [jobsRes, appsRes, candidatesRes, assignmentsRes, placementsRes] = await Promise.all([
            this.supabase.from('jobs').select('id', { count: 'exact', head: true }),
            this.supabase.from('applications').select('id', { count: 'exact', head: true }),
            this.supabase.from('candidates').select('id', { count: 'exact', head: true }),
            this.supabase.from('role_assignments').select('id', { count: 'exact', head: true }),
            this.supabase.from('placements').select('id', { count: 'exact', head: true }),
        ]);

        return {
            jobs: jobsRes.count || 0,
            applications: appsRes.count || 0,
            candidates: candidatesRes.count || 0,
            assignments: assignmentsRes.count || 0,
            placements: placementsRes.count || 0,
        };
    }
}
