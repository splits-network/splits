/**
 * Call Recordings V3 Types & JSON Schemas
 *
 * Flat CRUD types for the call_recordings table.
 * Views and actions define their own request/response shapes.
 */

// --- TypeScript Interfaces ---

export interface CallRecordingRow {
  id: string;
  call_id: string;
  recording_status: string;
  egress_id: string | null;
  blob_url: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface CreateCallRecordingInput {
  call_id: string;
  recording_status?: string;
  egress_id?: string;
  started_at?: string;
}

export interface UpdateCallRecordingInput {
  recording_status?: string;
  egress_id?: string;
  blob_url?: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  started_at?: string;
  ended_at?: string;
}

export interface CallRecordingListParams {
  page?: number;
  limit?: number;
  call_id?: string;
  recording_status?: string;
  sort_by?: string;
  sort_order?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    call_id: { type: 'string', format: 'uuid' },
    recording_status: { type: 'string' },
    sort_by: { type: 'string', enum: ['created_at', 'started_at', 'recording_status'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: false,
};

export const createSchema = {
  type: 'object',
  required: ['call_id'],
  properties: {
    call_id: { type: 'string', format: 'uuid' },
    recording_status: { type: 'string', maxLength: 50 },
    egress_id: { type: 'string', maxLength: 255 },
    started_at: { type: 'string', format: 'date-time' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    recording_status: { type: 'string', maxLength: 50 },
    egress_id: { type: 'string', maxLength: 255 },
    blob_url: { type: 'string', maxLength: 2048 },
    duration_seconds: { type: 'number', minimum: 0 },
    file_size_bytes: { type: 'number', minimum: 0 },
    started_at: { type: 'string', format: 'date-time' },
    ended_at: { type: 'string', format: 'date-time' },
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
