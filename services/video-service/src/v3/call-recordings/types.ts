/**
 * Call Recordings V3 Types & JSON Schemas
 */

export interface CallRecordingListParams {
  call_id?: string;
  recording_status?: string;
  page?: number;
  limit?: number;
}

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

export const callRecordingListQuerySchema = {
  type: 'object',
  properties: {
    call_id: { type: 'string', format: 'uuid' },
    recording_status: { type: 'string' },
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
  },
};

export const callIdParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const playbackQuerySchema = {
  type: 'object',
  properties: {
    recording_id: { type: 'string', format: 'uuid' },
  },
};
