/**
 * Job Notes — Types & JSON Schemas
 */

// ── TypeScript Types ──────────────────────────────────────────────

export type JobNoteCreatorType =
  | 'company_recruiter'
  | 'hiring_manager'
  | 'company_admin'
  | 'platform_admin';

export type JobNoteType =
  | 'general'
  | 'note'
  | 'info_request'
  | 'info_response'
  | 'improvement_request';

export type JobNoteVisibility = 'shared' | 'company_only';

export interface JobNoteCreate {
  job_id: string;
  created_by_type: JobNoteCreatorType;
  note_type: JobNoteType;
  visibility: JobNoteVisibility;
  message_text: string;
  in_response_to_id?: string;
}

export interface JobNoteUpdate {
  message_text?: string;
  visibility?: JobNoteVisibility;
}

export interface JobNote {
  id: string;
  job_id: string;
  created_by_user_id: string;
  created_by_type: JobNoteCreatorType;
  note_type: JobNoteType;
  visibility: JobNoteVisibility;
  message_text: string;
  in_response_to_id: string | null;
  created_at: string;
  updated_at: string;
  created_by?: { id: string; name: string; email: string };
}

export interface JobNoteFilters {
  job_id: string;
  note_type?: JobNoteType;
  visibility?: JobNoteVisibility;
  page?: number;
  limit?: number;
}

// ── JSON Schemas ──────────────────────────────────────────────────

export const jobNoteListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
    note_type: { type: 'string', enum: ['general', 'note', 'info_request', 'info_response', 'improvement_request'] },
    visibility: { type: 'string', enum: ['shared', 'company_only'] },
  },
  additionalProperties: false,
};

export const jobNoteCreateSchema = {
  type: 'object',
  required: ['message_text'],
  properties: {
    created_by_type: {
      type: 'string',
      enum: ['company_recruiter', 'hiring_manager', 'company_admin', 'platform_admin'],
    },
    note_type: {
      type: 'string',
      enum: ['general', 'note', 'info_request', 'info_response', 'improvement_request'],
      default: 'general',
    },
    visibility: {
      type: 'string',
      enum: ['shared', 'company_only'],
      default: 'company_only',
    },
    message_text: { type: 'string', minLength: 1, maxLength: 10000 },
    in_response_to_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const jobNoteUpdateSchema = {
  type: 'object',
  properties: {
    message_text: { type: 'string', minLength: 1, maxLength: 10000 },
    visibility: { type: 'string', enum: ['shared', 'company_only'] },
  },
  additionalProperties: false,
};
