/**
 * Recruiters V3 Types & JSON Schemas
 */

export interface RecruiterListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  specialization?: string;
  is_candidate_recruiter?: string;
  is_company_recruiter?: string;
  is_marketplace_enabled?: string;
  reputation_tier?: string;
  hire_rate_tier?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface RecruiterUpdate {
  name?: string;
  email?: string;
  phone?: string;
  slug?: string;
  specialization?: string;
  status?: string;
  candidate_recruiter?: boolean;
  company_recruiter?: boolean;
  [key: string]: any;
}

export interface CreateRecruiterInput {
  user_id: string;
  bio?: string;
  phone?: string;
  industries?: string[];
  specialization?: string;
  location?: string;
  taglines?: string[];
  years_experience?: number;
  status?: string;
  name?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    status: { type: 'string' },
    specialization: { type: 'string' },
    is_candidate_recruiter: { type: 'string' },
    is_company_recruiter: { type: 'string' },
    is_marketplace_enabled: { type: 'string' },
    reputation_tier: { type: 'string' },
    hire_rate_tier: { type: 'string' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    filters: { type: 'string' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['user_id'],
  properties: {
    user_id: { type: 'string', format: 'uuid' },
    bio: { type: 'string' },
    phone: { type: 'string' },
    industries: { type: 'array', items: { type: 'string' } },
    specialization: { type: 'string' },
    location: { type: 'string' },
    taglines: { type: 'array', items: { type: 'string' } },
    years_experience: { type: 'integer', minimum: 0 },
    status: { type: 'string' },
    name: { type: 'string' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    slug: { type: 'string' },
    specialization: { type: 'string' },
    status: { type: 'string' },
    candidate_recruiter: { type: 'boolean' },
    company_recruiter: { type: 'boolean' },
    bio: { type: 'string' },
    industries: { type: 'array', items: { type: 'string' } },
    location: { type: 'string' },
    taglines: { type: 'array', items: { type: 'string' } },
    years_experience: { type: 'integer', minimum: 0 },
    marketplace_enabled: { type: 'boolean' },
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

export const slugParamSchema = {
  type: 'object',
  required: ['slug'],
  properties: {
    slug: { type: 'string' },
  },
};
