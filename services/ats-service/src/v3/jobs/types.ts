/**
 * Jobs V3 Types & JSON Schemas
 */

// ── TypeScript Interfaces ──────────────────────────────────────────

export interface CreateJobInput {
  title: string;
  company_id?: string;
  source_firm_id?: string;
  department?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  fee_percentage?: number;
  guarantee_days?: number;
  description?: string;
  recruiter_description?: string;
  candidate_description?: string;
  employment_type?: string;
  open_to_relocation?: boolean;
  show_salary_range?: boolean;
  commute_types?: string[];
  job_level?: string;
  status?: string;
  pre_screen_questions?: any[];
  activates_at?: string | null;
  closes_at?: string | null;
}

export interface UpdateJobInput {
  title?: string;
  department?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  fee_percentage?: number;
  guarantee_days?: number;
  description?: string;
  recruiter_description?: string;
  candidate_description?: string;
  employment_type?: string;
  open_to_relocation?: boolean;
  show_salary_range?: boolean;
  commute_types?: string[];
  job_level?: string;
  status?: string;
  pre_screen_questions?: any[];
  activates_at?: string | null;
  closes_at?: string | null;
}

export interface JobListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  fields?: string;
  status?: string;
  location?: string;
  employment_type?: string;
  commute_type?: string | string[];
  job_level?: string;
  company_id?: string;
  job_owner_filter?: 'all' | 'assigned';
  // Internal scoping fields (set by service, not from query params)
  visible_statuses?: string[];
  owner_recruiter_id?: string;
  scoped_company_ids?: string[];
}

// ── JSON Schemas ───────────────────────────────────────────────────

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    sort_by: { type: 'string', enum: ['created_at', 'title', 'status', 'updated_at', 'salary_min', 'salary_max'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
    fields: { type: 'string' },
    status: { type: 'string' },
    location: { type: 'string' },
    employment_type: { type: 'string' },
    commute_type: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
    job_level: { type: 'string' },
    company_id: { type: 'string', format: 'uuid' },
    job_owner_filter: { type: 'string', enum: ['all', 'assigned'] },
  },
  additionalProperties: false,
};

export const createJobSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    company_id: { type: 'string', format: 'uuid' },
    source_firm_id: { type: 'string', format: 'uuid' },
    department: { type: 'string', maxLength: 100 },
    location: { type: 'string', maxLength: 200 },
    salary_min: { type: 'number', minimum: 0 },
    salary_max: { type: 'number', minimum: 0 },
    fee_percentage: { type: 'number', minimum: 0, maximum: 100 },
    guarantee_days: { type: 'integer', minimum: 0 },
    description: { type: 'string' },
    recruiter_description: { type: 'string' },
    candidate_description: { type: 'string' },
    employment_type: { type: 'string', enum: ['full_time', 'part_time', 'contract', 'temporary'] },
    open_to_relocation: { type: 'boolean' },
    show_salary_range: { type: 'boolean' },
    commute_types: {
      type: 'array',
      items: { type: 'string', enum: ['remote', 'hybrid_1', 'hybrid_2', 'hybrid_3', 'hybrid_4', 'in_office'] },
    },
    job_level: { type: 'string', enum: ['entry', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c_suite'] },
    status: { type: 'string', enum: ['draft', 'pending', 'early', 'active', 'priority'] },
    pre_screen_questions: { type: 'array' },
    activates_at: { type: ['string', 'null'], format: 'date-time' },
    closes_at: { type: ['string', 'null'], format: 'date-time' },
  },
  additionalProperties: false,
};

export const updateJobSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    department: { type: 'string', maxLength: 100 },
    location: { type: 'string', maxLength: 200 },
    salary_min: { type: 'number', minimum: 0 },
    salary_max: { type: 'number', minimum: 0 },
    fee_percentage: { type: 'number', minimum: 0, maximum: 100 },
    guarantee_days: { type: 'integer', minimum: 0 },
    description: { type: 'string' },
    recruiter_description: { type: 'string' },
    candidate_description: { type: 'string' },
    employment_type: { type: 'string', enum: ['full_time', 'part_time', 'contract', 'temporary'] },
    open_to_relocation: { type: 'boolean' },
    show_salary_range: { type: 'boolean' },
    commute_types: {
      type: 'array',
      items: { type: 'string', enum: ['remote', 'hybrid_1', 'hybrid_2', 'hybrid_3', 'hybrid_4', 'in_office'] },
    },
    job_level: { type: 'string', enum: ['entry', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c_suite'] },
    status: { type: 'string', enum: ['draft', 'pending', 'early', 'active', 'priority', 'paused', 'filled', 'closed'] },
    pre_screen_questions: { type: 'array' },
    activates_at: { type: ['string', 'null'], format: 'date-time' },
    closes_at: { type: ['string', 'null'], format: 'date-time' },
  },
  additionalProperties: false,
};
