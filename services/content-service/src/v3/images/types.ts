/**
 * Content Images V3 Types & JSON Schemas
 *
 * Table: content_images
 * Fields: name, alt_text, file_path, file_size, mime_type, width, height,
 *         storage_bucket, uploaded_by, tags
 */

export interface ImageListParams {
  page?: number;
  limit?: number;
  search?: string;
  mime_type?: string;
}

export interface UpdateImageInput {
  name?: string;
  alt_text?: string;
  tags?: string[];
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    mime_type: { type: 'string' },
  },
  additionalProperties: true,
};

export const updateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: 500 },
    alt_text: { type: 'string', maxLength: 500 },
    tags: { type: 'array', items: { type: 'string' } },
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
