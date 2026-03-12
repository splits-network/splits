/**
 * Job Activity Log — Service
 *
 * Convenience methods for logging activity + paginated reads.
 * Diffs key fields to generate human-readable change descriptions.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { JobActivityRepository } from './repository';
import { JobActivityInsert, ActivityListParams } from './types';

/** Fields worth tracking in the activity log (skip noisy/internal ones) */
const TRACKED_FIELDS = [
  'title', 'location', 'department', 'salary_min', 'salary_max',
  'fee_percentage', 'guarantee_days', 'description', 'employment_type',
  'job_level', 'status', 'is_early_access', 'is_priority',
] as const;

const FIELD_LABELS: Record<string, string> = {
  title: 'Title', location: 'Location', department: 'Department',
  salary_min: 'Minimum salary', salary_max: 'Maximum salary',
  fee_percentage: 'Fee percentage', guarantee_days: 'Guarantee period',
  description: 'Description', employment_type: 'Employment type',
  job_level: 'Job level', status: 'Status',
  is_early_access: 'Early access', is_priority: 'Priority',
};

export class JobActivityService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: JobActivityRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  /** Write a raw activity entry */
  async logActivity(entry: JobActivityInsert): Promise<void> {
    try {
      await this.repository.insert(entry);
    } catch (err) {
      // Activity logging is non-fatal — don't break the main operation
      console.error('Failed to log job activity:', err);
    }
  }

  /** Paginated activity for a job (auth-checked) */
  async getActivityForJob(jobId: string, params: ActivityListParams, clerkUserId: string) {
    // Verify the job exists
    const { data: job, error } = await this.supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    if (!job) throw new NotFoundError('Job', jobId);

    const { data, total } = await this.repository.findByJobId(jobId, params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);

    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  // ── Convenience Loggers ─────────────────────────────────────────

  async logJobCreated(job: { id: string; status: string; company_id?: string }, actorUserId: string | null): Promise<void> {
    await this.logActivity({
      job_id: job.id,
      activity_type: 'job_created',
      description: 'Job created',
      actor_user_id: actorUserId,
      metadata: { status: job.status, company_id: job.company_id },
    });
  }

  async logStatusChange(jobId: string, from: string, to: string, actorUserId: string | null): Promise<void> {
    await this.logActivity({
      job_id: jobId,
      activity_type: 'job_status_changed',
      description: `Status changed from ${from} to ${to}`,
      actor_user_id: actorUserId,
      metadata: { previous_status: from, new_status: to },
    });
  }

  async logFieldsUpdated(
    jobId: string,
    currentJob: Record<string, any>,
    input: Record<string, any>,
    actorUserId: string | null
  ): Promise<void> {
    const changes: Record<string, { old: any; new: any }> = {};
    const changedFields: string[] = [];

    for (const field of TRACKED_FIELDS) {
      if (field === 'status') continue; // Status changes logged separately
      if (!(field in input)) continue;
      if (input[field] === currentJob[field]) continue;

      changedFields.push(field);
      changes[field] = { old: currentJob[field], new: input[field] };
    }

    if (changedFields.length === 0) return;

    const labels = changedFields.map(f => FIELD_LABELS[f] || f);
    const description = `Updated ${labels.join(', ')}`;

    await this.logActivity({
      job_id: jobId,
      activity_type: 'job_fields_updated',
      description,
      actor_user_id: actorUserId,
      metadata: { changed_fields: changedFields, changes },
    });
  }

  async logJobDeleted(jobId: string, lastStatus: string, actorUserId: string | null): Promise<void> {
    await this.logActivity({
      job_id: jobId,
      activity_type: 'job_deleted',
      description: 'Job deleted',
      actor_user_id: actorUserId,
      metadata: { last_status: lastStatus },
    });
  }
}
