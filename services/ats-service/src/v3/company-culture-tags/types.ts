/**
 * Company Culture Tags V3 Types & JSON Schemas
 *
 * Junction table linking companies to culture tags.
 */

export interface CreateCompanyCultureTagInput {
  company_id: string;
  culture_tag_id: string;
}

export interface CompanyCultureTagListParams {
  company_id: string;
}

export interface BulkReplaceCompanyCultureTagsInput {
  culture_tags: Array<{ culture_tag_id: string }>;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  required: ['company_id'],
  properties: {
    company_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['company_id', 'culture_tag_id'],
  properties: {
    company_id: { type: 'string', format: 'uuid' },
    culture_tag_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const bulkReplaceSchema = {
  type: 'object',
  required: ['culture_tags'],
  properties: {
    culture_tags: {
      type: 'array',
      items: {
        type: 'object',
        required: ['culture_tag_id'],
        properties: {
          culture_tag_id: { type: 'string', format: 'uuid' },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

export const companyIdParamSchema = {
  type: 'object',
  required: ['companyId'],
  properties: {
    companyId: { type: 'string', format: 'uuid' },
  },
};

export const deleteParamSchema = {
  type: 'object',
  required: ['companyId', 'cultureTagId'],
  properties: {
    companyId: { type: 'string', format: 'uuid' },
    cultureTagId: { type: 'string', format: 'uuid' },
  },
};
