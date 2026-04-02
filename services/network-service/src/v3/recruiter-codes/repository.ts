/**
 * Recruiter-Codes V3 Repository — Pure Data Layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCodeListParams, RecruiterCodeUpdate } from './types.js';

interface ScopeFilters {
  recruiter_id?: string;
}

const CODE_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';
function generateCode(): string {
  let code = '';
  for (let i = 0; i < 8; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

const SELECT_CLAUSE = '*';

export class RecruiterCodeRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: RecruiterCodeListParams, scopeFilters?: ScopeFilters): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('recruiter_codes').select(SELECT_CLAUSE, { count: 'exact' }).is('deleted_at', null);

    if (scopeFilters?.recruiter_id) query = query.eq('recruiter_id', scopeFilters.recruiter_id);
    if (params.recruiter_id) query = query.eq('recruiter_id', params.recruiter_id);
    if (params.status) query = query.eq('status', params.status);
    if (params.search) query = query.or(`code.ilike.%${params.search}%,label.ilike.%${params.search}%`);
    if (params.is_default === 'yes') query = query.eq('is_default', true);
    else if (params.is_default === 'no') query = query.eq('is_default', false);
    if (params.expiry_status === 'active') query = query.gte('expiry_date', new Date().toISOString());
    else if (params.expiry_status === 'expired') query = query.lt('expiry_date', new Date().toISOString()).not('expiry_date', 'is', null);
    else if (params.expiry_status === 'no_expiry') query = query.is('expiry_date', null);
    if (params.has_usage_limit === 'yes') query = query.not('max_uses', 'is', null);
    else if (params.has_usage_limit === 'no') query = query.is('max_uses', null);

    query = query.order(params.sort_by || 'created_at', { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('recruiter_codes').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findByCode(code: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('recruiter_codes')
      .select('*, recruiter:recruiters!inner(id, user:users!recruiters_user_id_fkey!inner(name, email, profile_image_url))')
      .eq('code', code.toLowerCase()).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findDefaultByRecruiterId(recruiterId: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('recruiter_codes').select('*')
      .eq('recruiter_id', recruiterId).eq('is_default', true).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data;
  }

  async clearDefault(recruiterId: string): Promise<void> {
    const { error } = await this.supabase.from('recruiter_codes')
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq('recruiter_id', recruiterId).eq('is_default', true).is('deleted_at', null);
    if (error) throw error;
  }

  async create(recruiterId: string, data: Record<string, any>): Promise<any> {
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await this.findByCode(code);
      if (!existing) break;
      code = generateCode();
      attempts++;
    }
    if (attempts >= 10) throw new Error('Failed to generate unique referral code');
    if (data.is_default) await this.clearDefault(recruiterId);

    const { data: result, error } = await this.supabase.from('recruiter_codes').insert({
      recruiter_id: recruiterId, code, label: data.label || null, status: 'active',
      is_default: data.is_default ?? false, expiry_date: data.expiry_date ?? null,
      max_uses: data.max_uses ?? null, uses_remaining: data.uses_remaining ?? null,
    }).select(SELECT_CLAUSE).single();
    if (error) throw error;
    return result;
  }

  async update(id: string, updates: RecruiterCodeUpdate): Promise<any> {
    const { data, error } = await this.supabase.from('recruiter_codes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).is('deleted_at', null).select(SELECT_CLAUSE).single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('recruiter_codes')
      .update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }

  async countActiveByRecruiterId(recruiterId: string): Promise<number> {
    const { count, error } = await this.supabase.from('recruiter_codes')
      .select('*', { count: 'exact', head: true }).eq('recruiter_id', recruiterId).is('deleted_at', null);
    if (error) throw error;
    return count || 0;
  }

  async logUsage(codeId: string, recruiterId: string, userId: string, signupType?: string, ip?: string, ua?: string): Promise<any> {
    const { data, error } = await this.supabase.from('recruiter_codes_log').insert({
      recruiter_code_id: codeId, recruiter_id: recruiterId, user_id: userId,
      signup_type: signupType || null, ip_address: ip || null, user_agent: ua || null,
    }).select('*').single();
    if (error) throw error;
    return data;
  }

  async findLogByUserId(userId: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('recruiter_codes_log').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return data;
  }

  async getUsageLog(params: { page?: number; limit?: number; recruiter_code_id?: string }, scopeFilters?: ScopeFilters): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('recruiter_codes_log')
      .select('*, user:users!inner(name, email), recruiter_code:recruiter_codes!inner(code, label)', { count: 'exact' });
    if (scopeFilters?.recruiter_id) query = query.eq('recruiter_id', scopeFilters.recruiter_id);
    if (params.recruiter_code_id) query = query.eq('recruiter_code_id', params.recruiter_code_id);
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }
}
