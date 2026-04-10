/**
 * Admin V3 Repository — Pure Data Layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AdminListParams } from './types.js';

function paginate(params: AdminListParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 25));
  return { page, limit, offset: (page - 1) * limit };
}

function buildPagination(total: number, page: number, limit: number) {
  return { total, page, limit, total_pages: Math.ceil(total / limit) };
}

export class AdminRepository {
  constructor(private supabase: SupabaseClient) {}

  async getRecruiterById(id: string): Promise<any> {
    const { data: recruiter, error } = await this.supabase
      .from('recruiters')
      .select('*, user:users!recruiters_user_id_fkey(id, name, email, avatar_url, created_at)')
      .eq('id', id)
      .single();
    if (error) throw error;

    // Fetch related data in parallel
    const [reputation, firmMembership, companies, candidateCount] = await Promise.all([
      this.supabase.from('recruiter_reputation').select('*').eq('recruiter_id', id).maybeSingle(),
      this.supabase.from('firm_members').select('*, firm:firms!firm_members_firm_id_fkey(id, name, slug, status)').eq('recruiter_id', id).eq('status', 'active').maybeSingle(),
      this.supabase.from('recruiter_companies').select('*, company:companies!recruiter_companies_company_id_fkey(id, name, logo_url)').eq('recruiter_id', id).order('created_at', { ascending: false }).limit(20),
      this.supabase.from('recruiter_candidates').select('id', { count: 'exact', head: true }).eq('recruiter_id', id),
    ]);

    return {
      ...recruiter,
      reputation: reputation.data ?? null,
      firm_membership: firmMembership.data ?? null,
      companies: companies.data ?? [],
      candidate_count: candidateCount.count ?? 0,
    };
  }

  async listRecruiters(params: AdminListParams): Promise<{ data: any[]; pagination: any }> {
    const { page, limit, offset } = paginate(params);
    let query = this.supabase
      .from('recruiters')
      .select('*, user:users!recruiters_user_id_fkey(name, email)', { count: 'exact' });
    if (params.search) query = query.or(`tagline.ilike.%${params.search}%,bio.ilike.%${params.search}%`);
    if (params.status) query = query.eq('status', params.status);
    query = query.order(params.sort_by || 'created_at', { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
  }

  async updateRecruiter(id: string, updates: Record<string, unknown>): Promise<any> {
    const { data, error } = await this.supabase.from('recruiters')
      .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async updateRecruiterStatus(id: string, status: string): Promise<any> {
    const { data, error } = await this.supabase.from('recruiters')
      .update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async listRecruiterCompanies(params: AdminListParams): Promise<{ data: any[]; pagination: any }> {
    const { page, limit, offset } = paginate(params);
    let query = this.supabase.from('recruiter_companies').select(
      '*, company:companies!recruiter_companies_company_id_fkey(id, name, logo_url), recruiter:recruiters!recruiter_companies_recruiter_id_fkey(id, user:users!recruiters_user_id_fkey(name, email))',
      { count: 'exact' },
    );
    if (params.status) query = query.eq('status', params.status);
    query = query.order(params.sort_by || 'created_at', { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
  }

  async listFirms(params: AdminListParams): Promise<{ data: any[]; pagination: any }> {
    const { page, limit, offset } = paginate(params);
    let query = this.supabase.from('firms')
      .select('*, owner:users!firms_owner_user_id_fkey(name, email)', { count: 'exact' });
    if (params.search) query = query.ilike('name', `%${params.search}%`);
    if (params.status) query = query.eq('status', params.status);
    if (params.marketplace_status === 'pending_approval') {
      query = query.eq('marketplace_visible', true).is('marketplace_approved_at', null);
    } else if (params.marketplace_status === 'approved') {
      query = query.not('marketplace_approved_at', 'is', null);
    } else if (params.marketplace_status === 'not_listed') {
      query = query.eq('marketplace_visible', false);
    }
    query = query.order(params.sort_by || 'created_at', { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
  }

  async updateFirmMarketplaceApproval(firmId: string, approved: boolean): Promise<any> {
    const { data, error } = await this.supabase.from('firms').update({
      marketplace_approved_at: approved ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', firmId).select().single();
    if (error) throw error;
    return data;
  }

  async getCounts(): Promise<Record<string, number>> {
    const [recruiters, pending, companies, firms, firmsPending, firmsActive] = await Promise.all([
      this.supabase.from('recruiters').select('id', { count: 'exact', head: true }),
      this.supabase.from('recruiters').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      this.supabase.from('recruiter_companies').select('id', { count: 'exact', head: true }),
      this.supabase.from('firms').select('id', { count: 'exact', head: true }),
      this.supabase.from('firms').select('id', { count: 'exact', head: true }).eq('marketplace_visible', true).is('marketplace_approved_at', null),
      this.supabase.from('firms').select('id', { count: 'exact', head: true }).not('marketplace_approved_at', 'is', null),
    ]);
    return {
      recruiters: recruiters.count || 0, recruiters_pending: pending.count || 0,
      recruiter_companies: companies.count || 0, firms: firms.count || 0,
      firms_pending_approval: firmsPending.count || 0, firms_marketplace_active: firmsActive.count || 0,
    };
  }

  async getStats(period: string): Promise<{ recruiters: any; recruiterStatus: any[] }> {
    const DAY = 86_400_000;
    const configMap: Record<string, { buckets: number; bucketMs: number; periodMs: number }> = {
      '7d': { buckets: 7, bucketMs: DAY, periodMs: 7 * DAY },
      '90d': { buckets: 10, bucketMs: 9 * DAY, periodMs: 90 * DAY },
      '1y': { buckets: 12, bucketMs: 30 * DAY, periodMs: 365 * DAY },
      'all': { buckets: 10, bucketMs: 0, periodMs: 0 },
    };
    const config = configMap[period] ?? { buckets: 10, bucketMs: 3 * DAY, periodMs: 30 * DAY };
    const now = Date.now();

    const statusCounts = await Promise.all(
      ['active', 'pending', 'suspended', 'inactive'].map(async s => ({
        label: s, value: await this.countRecruiters(undefined, undefined, s),
      }))
    );

    if (period === 'all') {
      const total = await this.countRecruiters();
      return { recruiters: { sparkline: Array(config.buckets).fill(Math.floor(total / config.buckets)), trend: 0, total }, recruiterStatus: statusCounts };
    }

    const periodStart = new Date(now - config.periodMs).toISOString();
    const prevStart = new Date(now - config.periodMs * 2).toISOString();
    const sparkline = await Promise.all(
      Array.from({ length: config.buckets }, (_, i) => {
        const start = new Date(now - config.periodMs + i * config.bucketMs).toISOString();
        const end = new Date(Math.min(now, now - config.periodMs + (i + 1) * config.bucketMs)).toISOString();
        return this.countRecruiters(start, end);
      })
    );
    const [prevCount, total] = await Promise.all([this.countRecruiters(prevStart, periodStart), this.countRecruiters()]);
    const currentTotal = sparkline.reduce((a, b) => a + b, 0);
    const trend = prevCount === 0 ? (currentTotal > 0 ? 100 : 0) : Math.round(((currentTotal - prevCount) / prevCount) * 100);
    return { recruiters: { sparkline, trend, total }, recruiterStatus: statusCounts };
  }

  private async countRecruiters(from?: string, to?: string, status?: string): Promise<number> {
    let q = this.supabase.from('recruiters').select('id', { count: 'exact', head: true });
    if (from) q = q.gte('created_at', from);
    if (to) q = q.lt('created_at', to);
    if (status) q = q.eq('status', status);
    const { count } = await q;
    return count || 0;
  }
}
