/**
 * Leaderboards V3 Service — Read-only with entity enrichment
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { LeaderboardRepository } from './repository';
import { LeaderboardListParams } from './types';

export class LeaderboardService {
  private accessResolver: AccessContextResolver;

  constructor(private repository: LeaderboardRepository, private supabase: SupabaseClient) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: LeaderboardListParams, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const enriched = await this.enrichEntries(data, params.entity_type);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data: enriched, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const entry = await this.repository.findById(id);
    if (!entry) throw new NotFoundError('LeaderboardEntry', id);
    return entry;
  }

  async getEntityRank(entityType: string, entityId: string, period: string, metric: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const entry = await this.repository.findEntityRank(entityType, entityId, period, metric);
    if (!entry) return null;
    const [enriched] = await this.enrichEntries([entry], entityType);
    return enriched;
  }

  private async enrichEntries(entries: any[], entityType: string): Promise<any[]> {
    if (entries.length === 0) return entries;

    const entityIds = entries.map(e => e.entity_id);
    const nameMap = new Map<string, { display_name: string; avatar_url?: string }>();

    try {
      if (entityType === 'recruiter') {
        const { data: recruiters } = await this.supabase
          .from('recruiters')
          .select('id, user_id')
          .in('id', entityIds);
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
            .from('users')
            .select('id, name, profile_image_url')
            .in('id', userIds);
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
      } else if (entityType === 'candidate') {
        const { data } = await this.supabase
          .from('candidates')
          .select('id, full_name')
          .in('id', entityIds);
        for (const row of data || []) {
          nameMap.set(row.id, { display_name: row.full_name || 'Candidate' });
        }
      } else if (entityType === 'company') {
        const { data } = await this.supabase
          .from('companies')
          .select('id, name')
          .in('id', entityIds);
        for (const row of data || []) {
          nameMap.set(row.id, { display_name: row.name || 'Company' });
        }
      } else if (entityType === 'firm') {
        const { data } = await this.supabase
          .from('firms')
          .select('id, name')
          .in('id', entityIds);
        for (const row of data || []) {
          nameMap.set(row.id, { display_name: row.name || 'Firm' });
        }
      }
    } catch {
      // Enrichment failure is non-fatal — return entries without names
    }

    return entries.map(entry => {
      const info = nameMap.get(entry.entity_id);
      return {
        ...entry,
        display_name: info?.display_name,
        avatar_url: info?.avatar_url,
      };
    });
  }
}
