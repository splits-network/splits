/**
 * Reports V3 Types & JSON Schemas
 *
 * Table: chat_reports
 * Columns: id, reporter_user_id, reported_user_id, conversation_id,
 *          category, description, evidence_pointer, status, created_at, updated_at
 */

// --- Interfaces ---

export interface ChatReport {
  id: string;
  reporter_user_id: string;
  reported_user_id: string;
  conversation_id: string;
  category: string;
  description: string | null;
  evidence_pointer: string | null;
  status: 'new' | 'in_review' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export interface ReportListParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  status?: string;
}

export interface UpdateReportInput {
  status?: 'new' | 'in_review' | 'resolved' | 'dismissed';
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    sort_by: { type: 'string', enum: ['created_at', 'updated_at', 'status'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
    status: { type: 'string', enum: ['new', 'in_review', 'resolved', 'dismissed'] },
  },
  additionalProperties: false,
};

export const updateReportSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['new', 'in_review', 'resolved', 'dismissed'] },
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
