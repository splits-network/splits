/**
 * Application Notes V3 Types & JSON Schemas
 *
 * Notes on applications with visibility control (shared, candidate_only, company_only)
 * and creator-type tracking for role-based access.
 */

export interface CreateApplicationNoteInput {
  application_id: string;
  message_text: string;
  note_type?: 'general' | 'interview' | 'feedback' | 'system';
  visibility?: 'shared' | 'candidate_only' | 'company_only';
  created_by_type?: 'candidate' | 'candidate_recruiter' | 'company_recruiter' | 'hiring_manager' | 'company_admin' | 'platform_admin';
  in_response_to_id?: string;
}

export interface UpdateApplicationNoteInput {
  message_text?: string;
  visibility?: 'shared' | 'candidate_only' | 'company_only';
}

export interface ApplicationNoteListParams {
  page?: number;
  limit?: number;
  application_id?: string;
  note_type?: string;
  visibility?: string;
  in_response_to_id?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
    application_id: { type: 'string', format: 'uuid' },
    note_type: { type: 'string', enum: ['general', 'interview', 'feedback', 'system'] },
    visibility: { type: 'string', enum: ['shared', 'candidate_only', 'company_only'] },
    in_response_to_id: { type: 'string', format: 'uuid' },
  },
};

export const createSchema = {
  type: 'object',
  required: ['application_id', 'message_text'],
  properties: {
    application_id: { type: 'string', format: 'uuid' },
    message_text: { type: 'string', minLength: 1, maxLength: 10000 },
    note_type: { type: 'string', enum: ['general', 'interview', 'feedback', 'system'], default: 'general' },
    visibility: { type: 'string', enum: ['shared', 'candidate_only', 'company_only'], default: 'shared' },
    created_by_type: {
      type: 'string',
      enum: ['candidate', 'candidate_recruiter', 'company_recruiter', 'hiring_manager', 'company_admin', 'platform_admin'],
    },
    in_response_to_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    message_text: { type: 'string', minLength: 1, maxLength: 10000 },
    visibility: { type: 'string', enum: ['shared', 'candidate_only', 'company_only'] },
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
