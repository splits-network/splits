/**
 * Company Reputation V3 Types & JSON Schemas
 */

export interface CompanyReputationListParams {
  page?: number;
  limit?: number;
  company_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    company_id: { type: 'string', format: 'uuid' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
  additionalProperties: true,
};

export const companyIdParamSchema = {
  type: 'object',
  required: ['companyId'],
  properties: {
    companyId: { type: 'string', format: 'uuid' },
  },
};
