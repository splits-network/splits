/**
 * Email Templates V3 Types & JSON Schemas
 *
 * Table: email_templates
 * Fields: name, event_type, subject, template_html, status, variables
 */

export type TemplateStatus = 'active' | 'archived' | 'draft';

export interface TemplateListParams {
  page?: number;
  limit?: number;
  event_type?: string;
  status?: TemplateStatus;
  search?: string;
}

export interface CreateTemplateInput {
  name?: string;
  event_type: string;
  subject: string;
  template_html: string;
  status?: TemplateStatus;
  variables?: string[];
}

export interface UpdateTemplateInput {
  name?: string;
  event_type?: string;
  subject?: string;
  template_html?: string;
  status?: TemplateStatus;
  variables?: string[];
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    event_type: { type: 'string' },
    status: { type: 'string', enum: ['active', 'archived', 'draft'] },
    search: { type: 'string' },
  },
};

export const createSchema = {
  type: 'object',
  required: ['event_type', 'subject', 'template_html'],
  properties: {
    name: { type: 'string', maxLength: 200 },
    event_type: { type: 'string', minLength: 1, maxLength: 200 },
    subject: { type: 'string', minLength: 1, maxLength: 500 },
    template_html: { type: 'string', minLength: 1 },
    status: { type: 'string', enum: ['active', 'archived', 'draft'] },
    variables: { type: 'array', items: { type: 'string' } },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: 200 },
    event_type: { type: 'string', maxLength: 200 },
    subject: { type: 'string', maxLength: 500 },
    template_html: { type: 'string' },
    status: { type: 'string', enum: ['active', 'archived', 'draft'] },
    variables: { type: 'array', items: { type: 'string' } },
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
