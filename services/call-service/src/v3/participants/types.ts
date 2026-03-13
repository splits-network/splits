/**
 * Call Participants V3 Types & JSON Schemas
 */

export type CallParticipantRole = 'host' | 'participant' | 'observer';

export interface AddParticipantInput {
  user_id: string;
  role: CallParticipantRole;
}

export interface ParticipantListParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const callIdParamSchema = {
  type: 'object',
  required: ['callId'],
  properties: { callId: { type: 'string', format: 'uuid' } },
};

export const participantIdParamSchema = {
  type: 'object',
  required: ['callId', 'id'],
  properties: {
    callId: { type: 'string', format: 'uuid' },
    id: { type: 'string', format: 'uuid' },
  },
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    sort_by: { type: 'string', enum: ['created_at'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export const addParticipantSchema = {
  type: 'object',
  required: ['user_id', 'role'],
  properties: {
    user_id: { type: 'string' },
    role: { type: 'string', enum: ['host', 'participant', 'observer'] },
  },
  additionalProperties: false,
};
