/**
 * Conversations V3 Types & JSON Schemas
 *
 * Table: chat_conversations
 * Columns: id, participant_a_id, participant_b_id, subject, application_id,
 *          job_id, company_id, candidate_id, last_message_at, last_message_id,
 *          created_at, updated_at
 *
 * Participant table: chat_conversation_participants
 * Columns: conversation_id, user_id, muted_at, archived_at, request_state,
 *          last_read_at, last_read_message_id, unread_count, created_at, updated_at
 */

// --- Interfaces ---

export interface ChatConversation {
  id: string;
  participant_a_id: string;
  participant_b_id: string;
  subject: string | null;
  application_id: string | null;
  job_id: string | null;
  company_id: string | null;
  candidate_id: string | null;
  last_message_at: string | null;
  last_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UpdateConversationInput {
  subject?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    sort_by: { type: 'string', enum: ['created_at', 'updated_at', 'last_message_at'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    subject: { type: 'string', maxLength: 200 },
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
