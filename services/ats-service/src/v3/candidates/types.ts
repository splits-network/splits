/**
 * Candidates V3 Types & JSON Schemas
 */

export interface CreateCandidateInput {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  user_id?: string;
}

export interface UpdateCandidateInput {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  verification_status?: string;
  verification_metadata?: Record<string, any>;
  current_title?: string;
  current_company?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  bio?: string;
  marketplace_profile?: Record<string, any>;
  marketplace_visibility?: 'public' | 'limited' | 'hidden';
  show_email?: boolean;
  show_phone?: boolean;
  show_location?: boolean;
  show_current_company?: boolean;
  show_salary_expectations?: boolean;
  desired_salary_min?: number;
  desired_salary_max?: number;
  desired_job_type?: string;
  open_to_remote?: boolean;
  open_to_relocation?: boolean;
  availability?: string;
}

export interface CandidateListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'archived';
  activity_filter?: 'all' | 'active' | 'inactive';
  scope?: 'all' | 'mine' | 'saved';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  include?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    status: { type: 'string', enum: ['active', 'archived'] },
    activity_filter: { type: 'string', enum: ['all', 'active', 'inactive'], default: 'all' },
    scope: { type: 'string', enum: ['all', 'mine', 'saved'], default: 'all' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    include: { type: 'string' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['full_name', 'email'],
  properties: {
    full_name: { type: 'string', minLength: 1, maxLength: 255 },
    email: { type: 'string', format: 'email', maxLength: 255 },
    phone: { type: 'string', maxLength: 50 },
    location: { type: 'string', maxLength: 255 },
    user_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    full_name: { type: 'string', minLength: 1, maxLength: 255 },
    email: { type: 'string', format: 'email', maxLength: 255 },
    phone: { type: 'string', maxLength: 50 },
    location: { type: 'string', maxLength: 255 },
    verification_status: { type: 'string' },
    verification_metadata: { type: 'object' },
    current_title: { type: 'string', maxLength: 255 },
    current_company: { type: 'string', maxLength: 255 },
    linkedin_url: { type: 'string', maxLength: 500 },
    github_url: { type: 'string', maxLength: 500 },
    portfolio_url: { type: 'string', maxLength: 500 },
    bio: { type: 'string', maxLength: 5000 },
    marketplace_profile: { type: 'object' },
    marketplace_visibility: { type: 'string', enum: ['public', 'limited', 'hidden'] },
    show_email: { type: 'boolean' },
    show_phone: { type: 'boolean' },
    show_location: { type: 'boolean' },
    show_current_company: { type: 'boolean' },
    show_salary_expectations: { type: 'boolean' },
    desired_salary_min: { type: 'number', minimum: 0 },
    desired_salary_max: { type: 'number', minimum: 0 },
    desired_job_type: { type: 'string', maxLength: 50 },
    open_to_remote: { type: 'boolean' },
    open_to_relocation: { type: 'boolean' },
    availability: { type: 'string', maxLength: 50 },
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
