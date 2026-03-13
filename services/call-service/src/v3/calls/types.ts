/**
 * Calls V3 Types & JSON Schemas
 */

export type CallStatus = 'scheduled' | 'active' | 'completed' | 'cancelled' | 'missed' | 'no_show';
export type CallEntityType = 'application' | 'job' | 'company' | 'firm' | 'candidate';
export type CallParticipantRole = 'host' | 'participant' | 'observer';

export interface CreateCallInput {
  call_type: string;
  title?: string;
  scheduled_at?: string;
  agenda?: string;
  duration_minutes_planned?: number;
  pre_call_notes?: string;
  tags?: string[];
  entity_links?: { entity_type: CallEntityType; entity_id: string }[];
  participants?: { user_id: string; role: CallParticipantRole }[];
  recording_enabled?: boolean;
  transcription_enabled?: boolean;
  ai_analysis_enabled?: boolean;
}

export interface UpdateCallInput {
  title?: string;
  scheduled_at?: string;
  agenda?: string;
  needs_follow_up?: boolean;
}

export interface CallListParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  call_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  needs_follow_up?: boolean;
  search?: string;
  entity_type?: string;
  entity_id?: string;
  tag?: string;
  filters?: string;
}

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    sort_by: { type: 'string', enum: ['created_at', 'scheduled_at', 'status'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
    call_type: { type: 'string' },
    status: { type: 'string', enum: ['scheduled', 'active', 'completed', 'cancelled', 'missed', 'no_show'] },
    date_from: { type: 'string' },
    date_to: { type: 'string' },
    needs_follow_up: { type: 'boolean' },
    search: { type: 'string' },
    entity_type: { type: 'string' },
    entity_id: { type: 'string' },
    tag: { type: 'string' },
    filters: { type: 'string' },
  },
};

export const createCallSchema = {
  type: 'object',
  required: ['call_type'],
  properties: {
    call_type: { type: 'string', minLength: 1 },
    title: { type: 'string', maxLength: 255 },
    scheduled_at: { type: 'string' },
    agenda: { type: 'string', maxLength: 5000 },
    duration_minutes_planned: { type: 'integer', minimum: 1, maximum: 480 },
    pre_call_notes: { type: 'string', maxLength: 5000 },
    tags: { type: 'array', items: { type: 'string' } },
    entity_links: {
      type: 'array',
      items: {
        type: 'object',
        required: ['entity_type', 'entity_id'],
        properties: {
          entity_type: { type: 'string', enum: ['application', 'job', 'company', 'firm', 'candidate'] },
          entity_id: { type: 'string' },
        },
      },
    },
    participants: {
      type: 'array',
      items: {
        type: 'object',
        required: ['user_id', 'role'],
        properties: {
          user_id: { type: 'string' },
          role: { type: 'string', enum: ['host', 'participant', 'observer'] },
        },
      },
    },
    recording_enabled: { type: 'boolean' },
    transcription_enabled: { type: 'boolean' },
    ai_analysis_enabled: { type: 'boolean' },
  },
  additionalProperties: false,
};

export const updateCallSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', maxLength: 255 },
    scheduled_at: { type: 'string' },
    agenda: { type: 'string', maxLength: 5000 },
    needs_follow_up: { type: 'boolean' },
  },
  additionalProperties: false,
};
