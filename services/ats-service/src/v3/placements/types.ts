/**
 * Placements V3 Types & JSON Schemas
 *
 * Tracks placement records created when a candidate is hired,
 * including all 5 recruiter attribution roles for commission splits.
 */

export interface CreatePlacementInput {
  job_id: string;
  candidate_id: string;
  application_id: string;
  start_date: string;
  salary: number;
  fee_percentage: number;
  guarantee_days?: number;
  notes?: string;
}

export interface UpdatePlacementInput {
  state?: string;
  salary?: number;
  start_date?: string;
  fee_percentage?: number;
  guarantee_days?: number;
  notes?: string;
}

export interface PlacementListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  job_id?: string;
  candidate_id?: string;
  include?: string;
  salary_range?: string;
  fee_range?: string;
  fee_amount_range?: string;
  guarantee_status?: string;
  has_started?: string;
  is_replacement?: string;
  sort_by?: string;
  sort_order?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    status: { type: 'string', enum: ['hired', 'active', 'completed', 'failed'] },
    job_id: { type: 'string', format: 'uuid' },
    candidate_id: { type: 'string', format: 'uuid' },
    include: { type: 'string' },
    salary_range: { type: 'string', enum: ['under_50k', '50k_100k', '100k_150k', '150k_200k', 'over_200k'] },
    fee_range: { type: 'string', enum: ['under_15', '15_20', '20_25', 'over_25'] },
    fee_amount_range: { type: 'string', enum: ['under_10k', '10k_25k', '25k_50k', 'over_50k'] },
    guarantee_status: { type: 'string', enum: ['in_guarantee', 'expiring_soon', 'expired', 'no_guarantee'] },
    has_started: { type: 'string', enum: ['yes', 'no'] },
    is_replacement: { type: 'string', enum: ['yes', 'no'] },
    sort_by: { type: 'string', default: 'created_at' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['job_id', 'candidate_id', 'application_id', 'start_date', 'salary', 'fee_percentage'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    candidate_id: { type: 'string', format: 'uuid' },
    application_id: { type: 'string', format: 'uuid' },
    start_date: { type: 'string', format: 'date' },
    salary: { type: 'number', minimum: 0 },
    fee_percentage: { type: 'number', minimum: 0, maximum: 100 },
    guarantee_days: { type: 'integer', minimum: 0, default: 90 },
    notes: { type: 'string', maxLength: 5000 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    state: { type: 'string', enum: ['hired', 'active', 'completed', 'failed'] },
    salary: { type: 'number', minimum: 0 },
    start_date: { type: 'string', format: 'date' },
    fee_percentage: { type: 'number', minimum: 0, maximum: 100 },
    guarantee_days: { type: 'integer', minimum: 0 },
    notes: { type: 'string', maxLength: 5000 },
  },
  additionalProperties: false,
};

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
};
