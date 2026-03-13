/**
 * Companies V3 Types & JSON Schemas
 */

export interface CreateCompanyInput {
  name: string;
  identity_organization_id: string;
  description?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  stage?: string;
  founded_year?: number;
  tagline?: string;
  linkedin_url?: string;
  twitter_url?: string;
  glassdoor_url?: string;
}

export interface UpdateCompanyInput {
  name?: string;
  description?: string;
  website?: string;
  status?: string;
  industry?: string;
  company_size?: string;
  stage?: string;
  founded_year?: number | null;
  tagline?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  glassdoor_url?: string | null;
}

export interface CompanyListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  industry?: string;
  company_size?: string;
  stage?: string;
  has_open_roles?: string;
  identity_organization_id?: string;
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
    status: { type: 'string' },
    industry: { type: 'string' },
    company_size: { type: 'string' },
    stage: { type: 'string' },
    has_open_roles: { type: 'string', enum: ['yes', 'no'] },
    identity_organization_id: { type: 'string', format: 'uuid' },
    sort_by: { type: 'string', default: 'name' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['name', 'identity_organization_id'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    identity_organization_id: { type: 'string', format: 'uuid' },
    description: { type: 'string', maxLength: 5000 },
    website: { type: 'string', maxLength: 500 },
    industry: { type: 'string', maxLength: 100 },
    company_size: { type: 'string', maxLength: 50 },
    stage: { type: 'string', maxLength: 50 },
    founded_year: { type: 'integer', minimum: 1800, maximum: 2100 },
    tagline: { type: 'string', maxLength: 500 },
    linkedin_url: { type: 'string', maxLength: 500 },
    twitter_url: { type: 'string', maxLength: 500 },
    glassdoor_url: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string', maxLength: 5000 },
    website: { type: 'string', maxLength: 500 },
    status: { type: 'string' },
    industry: { type: 'string', maxLength: 100 },
    company_size: { type: 'string', maxLength: 50 },
    stage: { type: 'string', maxLength: 50 },
    founded_year: { type: ['integer', 'null'], minimum: 1800, maximum: 2100 },
    tagline: { type: ['string', 'null'], maxLength: 500 },
    linkedin_url: { type: ['string', 'null'], maxLength: 500 },
    twitter_url: { type: ['string', 'null'], maxLength: 500 },
    glassdoor_url: { type: ['string', 'null'], maxLength: 500 },
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
