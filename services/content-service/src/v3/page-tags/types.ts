/**
 * Content Page Tags V3 Types & JSON Schemas
 *
 * Junction table linking content pages to content tags.
 */

export interface CreatePageTagInput {
  page_id: string;
  tag_id: string;
}

export interface PageTagListParams {
  page_id: string;
}

export interface BulkReplacePageTagsInput {
  tags: Array<{ tag_id: string }>;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  required: ['page_id'],
  properties: {
    page_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['page_id', 'tag_id'],
  properties: {
    page_id: { type: 'string', format: 'uuid' },
    tag_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const bulkReplaceSchema = {
  type: 'object',
  required: ['tags'],
  properties: {
    tags: {
      type: 'array',
      items: {
        type: 'object',
        required: ['tag_id'],
        properties: {
          tag_id: { type: 'string', format: 'uuid' },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

export const pageIdParamSchema = {
  type: 'object',
  required: ['pageId'],
  properties: {
    pageId: { type: 'string', format: 'uuid' },
  },
};

export const deleteParamSchema = {
  type: 'object',
  required: ['pageId', 'tagId'],
  properties: {
    pageId: { type: 'string', format: 'uuid' },
    tagId: { type: 'string', format: 'uuid' },
  },
};
