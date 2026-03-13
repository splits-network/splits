/**
 * Pages V3 Types & JSON Schemas
 *
 * Table: content_pages
 * Fields: slug, title, description, content_blocks, status, app, page_type,
 *         seo_title, seo_description, og_image, published_at
 */

export type PageStatus = 'draft' | 'published' | 'archived';

export interface PageListParams {
  page?: number;
  limit?: number;
  status?: PageStatus;
  app?: string;
  page_type?: string;
  search?: string;
}

export interface CreatePageInput {
  slug: string;
  title: string;
  description?: string;
  content_blocks?: any[];
  status?: PageStatus;
  app?: string;
  page_type?: string;
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
}

export interface UpdatePageInput {
  slug?: string;
  title?: string;
  description?: string;
  content_blocks?: any[];
  status?: PageStatus;
  app?: string;
  page_type?: string;
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    status: { type: 'string', enum: ['draft', 'published', 'archived'] },
    app: { type: 'string' },
    page_type: { type: 'string' },
    search: { type: 'string' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['slug', 'title'],
  properties: {
    slug: { type: 'string', minLength: 1, maxLength: 500 },
    title: { type: 'string', minLength: 1, maxLength: 500 },
    description: { type: 'string', maxLength: 2000 },
    content_blocks: { type: 'array' },
    status: { type: 'string', enum: ['draft', 'published', 'archived'] },
    app: { type: 'string', maxLength: 100 },
    page_type: { type: 'string', maxLength: 100 },
    seo_title: { type: 'string', maxLength: 200 },
    seo_description: { type: 'string', maxLength: 500 },
    og_image: { type: 'string', maxLength: 1000 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    slug: { type: 'string', maxLength: 500 },
    title: { type: 'string', maxLength: 500 },
    description: { type: 'string', maxLength: 2000 },
    content_blocks: { type: 'array' },
    status: { type: 'string', enum: ['draft', 'published', 'archived'] },
    app: { type: 'string', maxLength: 100 },
    page_type: { type: 'string', maxLength: 100 },
    seo_title: { type: 'string', maxLength: 200 },
    seo_description: { type: 'string', maxLength: 500 },
    og_image: { type: 'string', maxLength: 1000 },
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

export const slugParamSchema = {
  type: 'object',
  required: ['slug'],
  properties: {
    slug: { type: 'string', minLength: 1 },
  },
};
