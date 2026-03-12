/**
 * Job Activity Log — Types & JSON Schemas
 */

// ── TypeScript Types ──────────────────────────────────────────────

export type JobActivityType =
  | 'job_created'
  | 'job_status_changed'
  | 'job_fields_updated'
  | 'job_deleted'
  | 'participant_added'
  | 'participant_removed';

export interface JobActivityInsert {
  job_id: string;
  activity_type: JobActivityType;
  description: string;
  actor_user_id: string | null;
  metadata?: Record<string, any>;
}

export interface JobActivityRecord {
  id: string;
  job_id: string;
  activity_type: JobActivityType;
  description: string;
  actor_user_id: string | null;
  actor_name: string | null;
  actor_avatar_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ActivityListParams {
  page?: number;
  limit?: number;
}

// ── JSON Schemas ──────────────────────────────────────────────────

export const activityListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
  },
  additionalProperties: false,
};
