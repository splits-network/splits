/**
 * Attachments V3 Types & JSON Schemas
 *
 * Table: chat_attachments
 * Columns: id, conversation_id, message_id, uploader_id, file_name, content_type,
 *          size_bytes, storage_key, status, scan_result, created_at, updated_at
 */

// --- Interfaces ---

export interface ChatAttachment {
  id: string;
  conversation_id: string;
  message_id: string | null;
  uploader_id: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  storage_key: string;
  status: 'pending_upload' | 'pending_scan' | 'available' | 'blocked' | 'deleted';
  scan_result: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttachmentListParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  conversation_id?: string;
  status?: string;
  fields?: string;
}

export interface InitUploadInput {
  conversation_id: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    sort_by: { type: 'string', enum: ['created_at', 'updated_at', 'file_name'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
    conversation_id: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['pending_upload', 'pending_scan', 'available', 'blocked', 'deleted'] },
    fields: { type: 'string', pattern: '^[a-z_,]+$' },
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

export const initUploadSchema = {
  type: 'object',
  required: ['conversation_id', 'file_name', 'content_type', 'size_bytes'],
  properties: {
    conversation_id: { type: 'string', format: 'uuid' },
    file_name: { type: 'string', minLength: 1, maxLength: 255 },
    content_type: { type: 'string', minLength: 1, maxLength: 255 },
    size_bytes: { type: 'integer', minimum: 1, maximum: 104857600 }, // 100MB
  },
  additionalProperties: false,
};

export const completeUploadParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
};
