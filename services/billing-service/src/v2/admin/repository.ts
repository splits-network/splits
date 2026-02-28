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

export class AdminBillingRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' },
        });
    }

    async listPayoutsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('placement_payout_transactions')
            .select('*', { count: 'exact' });

        if (params.status) {
            query = query.eq('status', params.status);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async listEscrowHoldsAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('escrow_holds')
            .select('*', { count: 'exact' });

        if (params.status) {
            query = query.eq('status', params.status);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async listBillingProfilesAdmin(params: AdminListParams): Promise<AdminListResponse<any>> {
        const { page, limit, offset } = paginate(params);
        const sortBy = params.sort_by || 'created_at';
        const ascending = params.sort_order === 'asc';

        let query = this.supabase
            .from('company_billing_profiles')
            .select('*', { count: 'exact' });

        if (params.search) {
            query = query.or(`stripe_customer_id.ilike.%${params.search}%`);
        }

        query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;

        return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
    }

    async releaseEscrowHold(id: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('escrow_holds')
            .update({ status: 'released', released_at: new Date().toISOString() })
            .eq('id', id)
            .eq('status', 'active')
            .select()
            .single();

        if (error) throw new Error(`Failed to release escrow hold: ${error.message}`);
        return data;
    }

    async getAdminCounts(): Promise<{
        payouts_pending: number;
        escrow_active: number;
        billing_profiles: number;
    }> {
        const [payoutsPendingRes, escrowActiveRes, billingProfilesRes] = await Promise.all([
            this.supabase
                .from('placement_payout_transactions')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'pending'),
            this.supabase
                .from('escrow_holds')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'active'),
            this.supabase
                .from('company_billing_profiles')
                .select('id', { count: 'exact', head: true }),
        ]);

        return {
            payouts_pending: payoutsPendingRes.count || 0,
            escrow_active: escrowActiveRes.count || 0,
            billing_profiles: billingProfilesRes.count || 0,
        };
    }
}
