/**
 * Placement Snapshot V3 Types — Interfaces & JSON Schemas
 */

export interface PlacementSnapshotCreate {
  placement_id: string;
  candidate_recruiter_id: string | null;
  company_recruiter_id: string | null;
  job_owner_recruiter_id: string | null;
  candidate_sourcer_recruiter_id: string | null;
  company_sourcer_recruiter_id: string | null;
  total_placement_fee: number;
  candidate_recruiter_tier: string | null;
  company_recruiter_tier: string | null;
  job_owner_tier: string | null;
  candidate_sourcer_tier: string | null;
  company_sourcer_tier: string | null;
  candidate_recruiter_firm_id?: string | null;
  candidate_recruiter_admin_take_rate?: number | null;
  company_recruiter_firm_id?: string | null;
  company_recruiter_admin_take_rate?: number | null;
  job_owner_firm_id?: string | null;
  job_owner_admin_take_rate?: number | null;
  candidate_sourcer_firm_id?: string | null;
  candidate_sourcer_admin_take_rate?: number | null;
  company_sourcer_firm_id?: string | null;
  company_sourcer_admin_take_rate?: number | null;
}

export interface PlacementSnapshotListParams {
  page?: number;
  limit?: number;
  placement_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    placement_id: { type: 'string' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: false,
};

export const placementIdParamSchema = {
  type: 'object',
  required: ['placementId'],
  properties: {
    placementId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
