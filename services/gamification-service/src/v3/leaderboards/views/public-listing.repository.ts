/**
 * Public Leaderboard Listing View Repository
 *
 * Queries leaderboard_entries and enriches with entity display names.
 * This is a view — joins across tables are expected.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardListParams } from '../types';

const SORTABLE_FIELDS = ['rank', 'score'];

export class PublicListingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: LeaderboardListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase.from('leaderboard_entries').select('*', { count: 'exact' })
      .eq('entity_type', params.entity_type)
      .eq('period', params.period)
      .eq('metric', params.metric);

    if (params.period_start) query = query.eq('period_start', params.period_start);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'rank';
    query = query.order(sortBy, { ascending: params.sort_order !== 'desc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('leaderboard_entries').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findEntityRank(
    entityType: string, entityId: string, period: string, metric: string
  ): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('period', period)
      .eq('metric', metric)
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async enrichEntries(entries: any[], entityType: string): Promise<any[]> {
    if (entries.length === 0) return entries;

    const entityIds = entries.map(e => e.entity_id);
    const nameMap = new Map<string, { display_name: string; avatar_url?: string }>();

    try {
      if (entityType === 'recruiter') {
        await this.enrichRecruiters(entityIds, nameMap);
      } else if (entityType === 'candidate') {
        await this.enrichCandidates(entityIds, nameMap);
      } else if (entityType === 'company') {
        await this.enrichCompanies(entityIds, nameMap);
      } else if (entityType === 'firm') {
        await this.enrichFirms(entityIds, nameMap);
      }
    } catch {
      // Enrichment failure is non-fatal — return entries without names
    }

    return entries.map(entry => {
      const info = nameMap.get(entry.entity_id);
      return { ...entry, display_name: info?.display_name, avatar_url: info?.avatar_url };
    });
  }

  private async enrichRecruiters(
    entityIds: string[],
    nameMap: Map<string, { display_name: string; avatar_url?: string }>
  ) {
    const { data: recruiters } = await this.supabase
      .from('recruiters').select('id, user_id').in('id', entityIds);
    const recruiterUserMap = new Map<string, string>();
    const userIds: string[] = [];
    for (const r of recruiters || []) {
      if (r.user_id) {
        recruiterUserMap.set(r.user_id, r.id);
        userIds.push(r.user_id);
      }
    }
    if (userIds.length > 0) {
      const { data: users } = await this.supabase
        .from('users').select('id, name, profile_image_url').in('id', userIds);
      for (const u of users || []) {
        const recruiterId = recruiterUserMap.get(u.id);
        if (recruiterId) {
          nameMap.set(recruiterId, {
            display_name: u.name || 'Recruiter',
            avatar_url: u.profile_image_url || undefined,
          });
        }
      }
    }
  }

  private async enrichCandidates(
    entityIds: string[],
    nameMap: Map<string, { display_name: string; avatar_url?: string }>
  ) {
    const { data } = await this.supabase
      .from('candidates').select('id, full_name').in('id', entityIds);
    for (const row of data || []) {
      nameMap.set(row.id, { display_name: row.full_name || 'Candidate' });
    }
  }

  private async enrichCompanies(
    entityIds: string[],
    nameMap: Map<string, { display_name: string; avatar_url?: string }>
  ) {
    const { data } = await this.supabase
      .from('companies').select('id, name').in('id', entityIds);
    for (const row of data || []) {
      nameMap.set(row.id, { display_name: row.name || 'Company' });
    }
  }

  private async enrichFirms(
    entityIds: string[],
    nameMap: Map<string, { display_name: string; avatar_url?: string }>
  ) {
    const { data } = await this.supabase
      .from('firms').select('id, name').in('id', entityIds);
    for (const row of data || []) {
      nameMap.set(row.id, { display_name: row.name || 'Firm' });
    }
  }
}
