/**
 * Bulk Replace Requirements Action Repository
 * Calls stored procedure for atomic operation
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface BulkRequirementItem {
  requirement_type: string;
  description: string;
  sort_order: number;
}

export class BulkReplaceRequirementsRepository {
  constructor(private supabase: SupabaseClient) {}

  async bulkReplace(jobId: string, requirements: BulkRequirementItem[]): Promise<any[]> {
    const { data, error } = await this.supabase
      .rpc('bulk_replace_job_requirements', {
        p_job_id: jobId,
        p_requirements: requirements,
      });

    if (error) throw error;
    return data || [];
  }
}
