/**
 * Admin Lists View Repository
 * Applications, candidates, assignments, placements for admin dashboard
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AdminListParams } from '../types.js';

function paginate(params: AdminListParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 25));
  return { page, limit, offset: (page - 1) * limit };
}

function buildPagination(total: number, page: number, limit: number) {
  return { total, page, limit, total_pages: Math.ceil(total / limit) };
}

export class AdminListsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getApplicationById(id: string): Promise<any> {
    const { data: app, error } = await this.supabase
      .from('applications')
      .select('*, job:jobs(id, title, status, company:companies(id, name)), candidate:candidates(id, first_name, last_name, email, phone, location, resume_status)')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Fetch notes for this application (stage changes, admin notes, etc.)
    const { data: notes } = await this.supabase
      .from('application_notes')
      .select('id, note_type, visibility, body, author_name, created_at')
      .eq('application_id', id)
      .order('created_at', { ascending: true });

    return { ...app, notes: notes ?? [] };
  }

  async updateApplicationStage(id: string, stage: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('applications')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listApplications(params: AdminListParams) {
    const { page, limit, offset } = paginate(params);
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase
      .from('applications')
      .select('*, job:jobs(id, title), candidate:candidates(id, full_name, email)', { count: 'exact' });

    if (params.stage) query = query.eq('stage', params.stage);
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
  }

  async getCandidateById(id: string): Promise<any> {
    const { data: candidate, error } = await this.supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const [applications, recruiterRels] = await Promise.all([
      this.supabase
        .from('applications')
        .select('id, stage, job_id, job_title, company_name, created_at')
        .eq('candidate_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
      this.supabase
        .from('recruiter_candidates')
        .select('id, recruiter_id, status, candidate_name, created_at')
        .eq('candidate_id', id)
        .eq('status', 'active')
        .limit(10),
    ]);

    return {
      ...candidate,
      applications: applications.data ?? [],
      recruiter_relationships: recruiterRels.data ?? [],
    };
  }

  async getPlacementById(id: string): Promise<any> {
    const { data: placement, error } = await this.supabase
      .from('placements')
      .select('*, job:jobs(id, title, status), candidate:candidates(id, full_name, email, phone, location), company:companies(id, name, logo_url)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return placement;
  }

  async updatePlacement(id: string, updates: Record<string, unknown>): Promise<any> {
    const { data, error } = await this.supabase
      .from('placements')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listCandidates(params: AdminListParams) {
    const { page, limit, offset } = paginate(params);
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase
      .from('candidates')
      .select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
  }

  async listAssignments(params: AdminListParams) {
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

  async listPlacements(params: AdminListParams) {
    const { page, limit, offset } = paginate(params);
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase
      .from('placements')
      .select('*', { count: 'exact' });

    if (params.state) query = query.eq('state', params.state);
    if (params.search) {
      query = query.or(`candidate_name.ilike.%${params.search}%,company_name.ilike.%${params.search}%`);
    }
    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], pagination: buildPagination(count || 0, page, limit) };
  }
}
