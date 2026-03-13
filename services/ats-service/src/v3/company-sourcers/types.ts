/**
 * Company Sourcers V3 Types & JSON Schemas
 *
 * Tracks which recruiter sourced a company relationship,
 * including protection window for sourcer attribution.
 */

export interface CreateCompanySourcerInput {
  company_id: string;
  sourcer_recruiter_id: string;
  sourcer_type?: 'recruiter' | 'tsn';
  notes?: string;
}

export interface UpdateCompanySourcerInput {
  notes?: string;
  protection_window_days?: number;
}

export interface CompanySourcerListParams {
  page?: number;
  limit?: number;
  company_id?: string;
  recruiter_id?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    company_id: { type: 'string', format: 'uuid' },
    recruiter_id: { type: 'string', format: 'uuid' },
  },
};

export const createSchema = {
  type: 'object',
  required: ['company_id', 'sourcer_recruiter_id'],
  properties: {
    company_id: { type: 'string', format: 'uuid' },
    sourcer_recruiter_id: { type: 'string', format: 'uuid' },
    sourcer_type: { type: 'string', enum: ['recruiter', 'tsn'], default: 'recruiter' },
    notes: { type: 'string', maxLength: 2000 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    notes: { type: 'string', maxLength: 2000 },
    protection_window_days: { type: 'integer', minimum: 0, maximum: 3650 },
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

export const companyIdParamSchema = {
  type: 'object',
  required: ['companyId'],
  properties: {
    companyId: { type: 'string', format: 'uuid' },
  },
};
