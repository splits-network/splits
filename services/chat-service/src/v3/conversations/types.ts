/**
 * Conversations V3 Types & JSON Schemas
 *
 * Table: chat_conversations + chat_conversation_participants
 * Core CRUD for conversations. Messages, blocking, reporting, etc. are actions/views.
 */

export interface ConversationListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateConversationInput {
  participant_ids: string[];
  subject?: string;
  initial_message?: string;
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
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['participant_ids'],
  properties: {
    participant_ids: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      minItems: 1,
      maxItems: 10,
    },
    subject: { type: 'string', maxLength: 200 },
    initial_message: { type: 'string', maxLength: 5000 },
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

export const sendMessageSchema = {
  type: 'object',
  required: ['body'],
  properties: {
    body: { type: 'string', minLength: 1, maxLength: 5000 },
    reply_to_message_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
