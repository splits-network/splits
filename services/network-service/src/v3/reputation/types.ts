/**
 * Reputation V3 Types & JSON Schemas
 */

export interface ReputationListParams {
  page?: number;
  limit?: number;
  recruiter_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ReputationUpdate {
  total_placements?: number;
  successful_placements?: number;
  rating?: number;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    recruiter_id: { type: 'string', format: 'uuid' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['recruiter_id'],
  properties: {
    recruiter_id: { type: 'string', format: 'uuid' },
    rating: { type: 'number', minimum: 0, maximum: 5 },
    total_placements: { type: 'integer', minimum: 0 },
    successful_placements: { type: 'integer', minimum: 0 },
    average_time_to_placement_days: { type: 'number', minimum: 0 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    rating: { type: 'number', minimum: 0, maximum: 5 },
    total_placements: { type: 'integer', minimum: 0 },
    successful_placements: { type: 'integer', minimum: 0 },
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
