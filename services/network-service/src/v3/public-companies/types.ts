/**
 * Public Companies V3 Types & JSON Schemas
 */

export interface PublicCompanyListParams {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  company_size?: string;
  stage?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PublicCompanyJobsParams {
  page?: number;
  limit?: number;
}

export const PUBLIC_COMPANY_SELECT = [
  'id', 'name', 'slug', 'tagline', 'description', 'logo_url',
  'website', 'industry', 'company_size', 'headquarters_location',
  'stage', 'founded_year', 'linkedin_url', 'twitter_url', 'glassdoor_url',
  'created_at',
].join(', ');

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    search: { type: 'string' },
    industry: { type: 'string' },
    company_size: { type: 'string' },
    stage: { type: 'string' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
} as const;

export const jobsQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
  },
} as const;

export const slugParamSchema = {
  type: 'object',
  required: ['slug'],
  properties: { slug: { type: 'string' } },
} as const;
