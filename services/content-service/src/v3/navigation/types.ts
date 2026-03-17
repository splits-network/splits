/**
 * Navigation V3 Types & JSON Schemas
 *
 * Table: content_navigation
 * Fields: app, location, items (JSON array of nav items)
 */

export interface NavigationListParams {
  page?: number;
  limit?: number;
  app?: string;
  location?: string;
}

export interface UpsertNavigationInput {
  app: string;
  location: string;
  items: any[];
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    app: { type: 'string' },
    location: { type: 'string' },
  },
  additionalProperties: true,
};

export const upsertSchema = {
  type: 'object',
  required: ['app', 'location', 'items'],
  properties: {
    app: { type: 'string', minLength: 1, maxLength: 100 },
    location: { type: 'string', minLength: 1, maxLength: 100 },
    items: { type: 'array' },
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
