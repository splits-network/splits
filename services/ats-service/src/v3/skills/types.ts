/**
 * Skills V3 Types & JSON Schemas
 *
 * Master lookup table for skills. Fields: name, category.
 */

export interface CreateSkillInput {
  name: string;
  category?: string;
}

export interface SkillListParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    q: { type: 'string' },
    category: { type: 'string' },
  },
};

export const createSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 200 },
    category: { type: 'string', maxLength: 200 },
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
