/**
 * Recruiter-Candidates V3 Repository — Pure Data Layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { RecruiterCandidateListParams } from './types.js';

export class RecruiterCandidateRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: RecruiterCandidateListParams
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('recruiter_candidates')
      .select('*', { count: 'exact' });

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findExistingRelationship(recruiterId: string, candidateId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_candidates')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .eq('candidate_id', candidateId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_candidates').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase.from('recruiter_candidates').insert(record).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_candidates').update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { data: existing } = await this.supabase
      .from('recruiter_candidates').select('consent_given, candidate_id').eq('id', id).single();
    if (!existing) throw new Error('Recruiter-candidate relationship not found');

    if (!existing.consent_given && !existing.candidate_id) {
      const { error } = await this.supabase.from('recruiter_candidates').delete().eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await this.supabase
        .from('recruiter_candidates').update({ status: 'terminated', updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    }
  }

  async findByInvitationToken(token: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiter_candidates')
      .select(`*, recruiter:recruiters!recruiter_id(id, user_id, bio, status, user:users!recruiters_user_id_fkey(name, email)), candidate:candidates!candidate_id(id, user_id, full_name, phone, location, linkedin_url, user:users!candidates_user_id_fkey(name, email))`)
      .eq('invitation_token', token).maybeSingle();
    if (error) throw error;
    return data;
  }

  async resendInvitation(id: string): Promise<any> {
    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    const { data, error } = await this.supabase
      .from('recruiter_candidates')
      .update({ invitation_token: token, invitation_expires_at: expires.toISOString(), invited_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  generateInvitationToken(): string {
    return randomBytes(32).toString('hex');
  }
}
