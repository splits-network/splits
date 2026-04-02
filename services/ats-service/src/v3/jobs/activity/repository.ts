/**
 * Job Activity Log — Repository
 *
 * Handles reads and writes for the job_activity_log table.
 * Actor info (name, avatar) is resolved via a separate users lookup.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { JobActivityInsert, JobActivityRecord, ActivityListParams } from './types.js';

export class JobActivityRepository {
  constructor(private supabase: SupabaseClient) {}

  async insert(entry: JobActivityInsert): Promise<void> {
    const { error } = await this.supabase
      .from('job_activity_log')
      .insert({
        job_id: entry.job_id,
        activity_type: entry.activity_type,
        description: entry.description,
        actor_user_id: entry.actor_user_id,
        metadata: entry.metadata || {},
      });

    if (error) throw error;
  }

  async findByJobId(
    jobId: string,
    params: ActivityListParams
  ): Promise<{ data: JobActivityRecord[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    // Fetch activity entries
    const { data: entries, count, error } = await this.supabase
      .from('job_activity_log')
      .select('*', { count: 'exact' })
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!entries || entries.length === 0) {
      return { data: [], total: 0 };
    }

    // Batch-resolve actor info from users table
    const actorIds = [...new Set(
      entries.map((e: any) => e.actor_user_id).filter(Boolean)
    )];

    let actorMap: Record<string, { name: string; avatar_url: string | null }> = {};

    if (actorIds.length > 0) {
      const { data: users } = await this.supabase
        .from('users')
        .select('id, first_name, last_name, avatar_url')
        .in('id', actorIds);

      if (users) {
        for (const u of users) {
          actorMap[u.id] = {
            name: [u.first_name, u.last_name].filter(Boolean).join(' '),
            avatar_url: u.avatar_url,
          };
        }
      }
    }

    const data: JobActivityRecord[] = entries.map((e: any) => ({
      id: e.id,
      job_id: e.job_id,
      activity_type: e.activity_type,
      description: e.description,
      actor_user_id: e.actor_user_id,
      actor_name: e.actor_user_id ? actorMap[e.actor_user_id]?.name || null : null,
      actor_avatar_url: e.actor_user_id ? actorMap[e.actor_user_id]?.avatar_url || null : null,
      metadata: e.metadata || {},
      created_at: e.created_at,
    }));

    return { data, total: count || 0 };
  }
}
