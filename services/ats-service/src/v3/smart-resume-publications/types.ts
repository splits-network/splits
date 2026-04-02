/**
 * Smart Resume Publications V3 Types & JSON Schemas
 *
 * Child of smart_resume_profiles. Papers, articles, talks, patents, and books.
 */

export interface CreateSmartResumePublicationInput {
  profile_id: string;
  title: string;
  publication_type?: 'paper' | 'article' | 'talk' | 'patent' | 'book' | 'other';
  publisher?: string;
  url?: string;
  published_date?: string;
  description?: string;
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface UpdateSmartResumePublicationInput {
  title?: string;
  publication_type?: 'paper' | 'article' | 'talk' | 'patent' | 'book' | 'other';
  publisher?: string;
  url?: string;
  published_date?: string;
  description?: string;
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface SmartResumePublicationListParams {
  page?: number;
  limit?: number;
  profile_id: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  required: ['profile_id'],
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    profile_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['profile_id', 'title'],
  properties: {
    profile_id: { type: 'string', format: 'uuid' },
    title: { type: 'string', minLength: 1, maxLength: 500 },
    publication_type: { type: 'string', enum: ['paper', 'article', 'talk', 'patent', 'book', 'other'] },
    publisher: { type: 'string', maxLength: 500 },
    url: { type: 'string', maxLength: 2000 },
    published_date: { type: 'string' },
    description: { type: 'string', maxLength: 5000 },
    visible_to_matching: { type: 'boolean' },
    sort_order: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 500 },
    publication_type: { type: 'string', enum: ['paper', 'article', 'talk', 'patent', 'book', 'other'] },
    publisher: { type: 'string', maxLength: 500 },
    url: { type: 'string', maxLength: 2000 },
    published_date: { type: 'string' },
    description: { type: 'string', maxLength: 5000 },
    visible_to_matching: { type: 'boolean' },
    sort_order: { type: 'integer', minimum: 0 },
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
