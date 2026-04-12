/**
 * Companies V3 Types & JSON Schemas
 */

export interface SocialLinkInput {
  url: string;
  label?: string;
}

export interface CreateCompanyInput {
  name: string;
  identity_organization_id: string;
  description?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  headquarters_location?: string;
  stage?: string;
  founded_year?: number;
  tagline?: string;
  logo_url?: string;
  logo_path?: string;
  banner_url?: string;
  banner_path?: string;
  mission_statement?: string;
  benefits_summary?: string;
  employee_count?: number;
  tech_stack?: string;
  hiring_process?: string;
  social_links?: SocialLinkInput[];
}

export interface UpdateCompanyInput {
  name?: string;
  slug?: string;
  description?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  headquarters_location?: string;
  stage?: string;
  founded_year?: number | null;
  tagline?: string | null;
  logo_url?: string | null;
  logo_path?: string | null;
  banner_url?: string | null;
  banner_path?: string | null;
  marketplace_visible?: boolean;
  mission_statement?: string | null;
  benefits_summary?: string | null;
  employee_count?: number | null;
  tech_stack?: string | null;
  hiring_process?: string | null;
  social_links?: SocialLinkInput[];
}

export interface CompanyListParams {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  company_size?: string;
  stage?: string;
  has_open_roles?: string;
  identity_organization_id?: string;
  sort_by?: string;
  sort_order?: string;
}

// --- JSON Schemas ---

const socialLinkSchema = {
  type: 'object',
  required: ['url'],
  properties: {
    url: { type: 'string', maxLength: 500 },
    label: { type: 'string', maxLength: 100 },
  },
  additionalProperties: false,
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
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
    headquarters_location: { type: 'string', maxLength: 255 },
    stage: { type: 'string', maxLength: 50 },
    founded_year: { type: 'integer', minimum: 1800, maximum: 2100 },
    tagline: { type: 'string', maxLength: 500 },
    logo_url: { type: 'string', maxLength: 500 },
    logo_path: { type: 'string', maxLength: 500 },
    banner_url: { type: 'string', maxLength: 500 },
    banner_path: { type: 'string', maxLength: 500 },
    mission_statement: { type: 'string', maxLength: 5000 },
    benefits_summary: { type: 'string', maxLength: 5000 },
    employee_count: { type: 'integer', minimum: 1 },
    tech_stack: { type: 'string', maxLength: 5000 },
    hiring_process: { type: 'string', maxLength: 5000 },
    social_links: { type: 'array', items: socialLinkSchema, maxItems: 20 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    slug: { type: 'string', minLength: 1, maxLength: 100, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
    description: { type: 'string', maxLength: 5000 },
    website: { type: 'string', maxLength: 500 },
    industry: { type: 'string', maxLength: 100 },
    company_size: { type: 'string', maxLength: 50 },
    headquarters_location: { type: ['string', 'null'], maxLength: 255 },
    stage: { type: 'string', maxLength: 50 },
    founded_year: { type: ['integer', 'null'], minimum: 1800, maximum: 2100 },
    tagline: { type: ['string', 'null'], maxLength: 500 },
    logo_url: { type: ['string', 'null'], maxLength: 500 },
    logo_path: { type: ['string', 'null'], maxLength: 500 },
    banner_url: { type: ['string', 'null'], maxLength: 500 },
    banner_path: { type: ['string', 'null'], maxLength: 500 },
    marketplace_visible: { type: 'boolean' },
    mission_statement: { type: ['string', 'null'], maxLength: 5000 },
    benefits_summary: { type: ['string', 'null'], maxLength: 5000 },
    employee_count: { type: ['integer', 'null'], minimum: 1 },
    tech_stack: { type: ['string', 'null'], maxLength: 5000 },
    hiring_process: { type: ['string', 'null'], maxLength: 5000 },
    social_links: { type: 'array', items: socialLinkSchema, maxItems: 20 },
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
