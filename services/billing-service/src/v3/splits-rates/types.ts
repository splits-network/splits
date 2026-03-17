/**
 * Splits Rates V3 Types — Interfaces & JSON Schemas
 */

export interface SplitsRateUpdateInput {
  candidate_recruiter_rate: number;
  job_owner_rate: number;
  company_recruiter_rate: number;
  candidate_sourcer_rate: number;
  company_sourcer_rate: number;
}

export const planIdParamSchema = {
  type: 'object',
  required: ['planId'],
  properties: {
    planId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  required: [
    'candidate_recruiter_rate',
    'job_owner_rate',
    'company_recruiter_rate',
    'candidate_sourcer_rate',
    'company_sourcer_rate',
  ],
  properties: {
    candidate_recruiter_rate: { type: 'number', minimum: 0, maximum: 100 },
    job_owner_rate: { type: 'number', minimum: 0, maximum: 100 },
    company_recruiter_rate: { type: 'number', minimum: 0, maximum: 100 },
    candidate_sourcer_rate: { type: 'number', minimum: 0, maximum: 100 },
    company_sourcer_rate: { type: 'number', minimum: 0, maximum: 100 },
  },
  additionalProperties: false,
};
