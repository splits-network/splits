/**
 * Company-Invitations V3 Repository — Pure Data Layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyInvitationListParams } from './types';

interface ScopeFilters {
  recruiter_id?: string;
}

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `SPLITS-${code}`;
}

const LOOKUP_SELECT = '*, recruiter:recruiters!inner(id, tagline, location, years_experience, industries, specialties, user:users!recruiters_user_id_fkey!inner(name, email, profile_image_url))';

export class CompanyInvitationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: CompanyInvitationListParams, scopeFilters?: ScopeFilters): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('recruiter_company_invitations').select('*', { count: 'exact' }).is('deleted_at', null);
    if (scopeFilters?.recruiter_id) query = query.eq('recruiter_id', scopeFilters.recruiter_id);
    if (params.recruiter_id) query = query.eq('recruiter_id', params.recruiter_id);
    if (params.status) query = query.eq('status', params.status);
    if (params.invited_email) query = query.eq('invited_email', params.invited_email);
    if (params.search) query = query.or(`invited_email.ilike.%${params.search}%,company_name_hint.ilike.%${params.search}%,invite_code.ilike.%${params.search}%`);
    if (params.has_email === 'yes') query = query.not('email_sent_at', 'is', null);
    else if (params.has_email === 'no') query = query.is('email_sent_at', null);
    if (params.expiry_status === 'active') query = query.gte('expires_at', new Date().toISOString());
    else if (params.expiry_status === 'expired') query = query.lt('expires_at', new Date().toISOString());

    query = query.order(params.sort_by || 'created_at', { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('recruiter_company_invitations').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findByCode(code: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('recruiter_company_invitations').select(LOOKUP_SELECT).eq('invite_code', code.toUpperCase()).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findByToken(token: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('recruiter_company_invitations').select(LOOKUP_SELECT).eq('invite_link_token', token).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(recruiterId: string, data: Record<string, any>): Promise<any> {
    let inviteCode = generateInviteCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await this.findByCode(inviteCode);
      if (!existing) break;
      inviteCode = generateInviteCode();
      attempts++;
    }
    if (attempts >= 10) throw new Error('Failed to generate unique invite code');

    const { data: result, error } = await this.supabase.from('recruiter_company_invitations').insert({
      recruiter_id: recruiterId, invite_code: inviteCode,
      invited_email: data.invited_email?.toLowerCase(), company_name_hint: data.company_name_hint,
      personal_message: data.personal_message, status: 'pending',
    }).select('*').single();
    if (error) throw error;
    return result;
  }

  async update(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('recruiter_company_invitations')
      .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('recruiter_company_invitations')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }
}
