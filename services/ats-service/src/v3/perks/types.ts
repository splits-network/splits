/**
 * Perks V3 Types & JSON Schemas
 *
 * Master lookup table for perks. Fields: name, category.
 */

export interface CreatePerkInput {
  name: string;
  category?: string;
}

export interface PerkListParams {
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
  additionalProperties: true,
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
