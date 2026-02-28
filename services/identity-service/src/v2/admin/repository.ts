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

export class AdminIdentityRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' },
        });
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    async listUsersAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('users')
            .select('*', { count: 'exact' });

        if (params.search) {
            query = query.or(
                `email.ilike.%${params.search}%,first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`
            );
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async getUserAdmin(id: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async listOrganizationsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('organizations')
            .select('*', { count: 'exact' });

        if (params.search) {
            query = query.or(`name.ilike.%${params.search}%,slug.ilike.%${params.search}%`);
        }

        if (params.status) {
            query = query.eq('status', params.status);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async getAdminCounts(): Promise<{ users: number; organizations: number }> {
        const [usersResult, orgsResult] = await Promise.all([
            this.supabase.from('users').select('id', { count: 'exact', head: true }),
            this.supabase.from('organizations').select('id', { count: 'exact', head: true }),
        ]);

        return {
            users: usersResult.count || 0,
            organizations: orgsResult.count || 0,
        };
    }

    async getAdminActivity(params: { scope?: string; limit?: number }): Promise<any[]> {
        const limit = Math.min(50, Math.max(1, params.limit ?? 20));

        // Query recent user and org activity from the audit trail
        // user_roles changes + user creations serve as admin activity
        const { data: roleChanges } = await this.supabase
            .from('user_roles')
            .select('id, user_id, role_name, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);

        const { data: recentUsers } = await this.supabase
            .from('users')
            .select('id, email, first_name, last_name, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);

        // Merge and sort by created_at descending
        const activities: any[] = [];

        for (const role of (roleChanges || [])) {
            activities.push({
                id: `role-${role.id}`,
                type: 'role_assigned',
                description: `Role "${role.role_name}" assigned`,
                entityId: role.user_id,
                createdAt: role.created_at,
            });
        }

        for (const user of (recentUsers || [])) {
            activities.push({
                id: `user-${user.id}`,
                type: 'user_created',
                description: `User ${user.first_name || ''} ${user.last_name || ''} (${user.email}) registered`.trim(),
                actor: user.email,
                entityId: user.id,
                createdAt: user.created_at,
            });
        }

        // Sort combined by createdAt descending, take limit
        activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return activities.slice(0, limit);
    }
}
