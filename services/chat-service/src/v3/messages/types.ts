/**
 * Messages V3 Types & JSON Schemas
 *
 * Table: chat_messages
 * Core CRUD for messages within conversations.
 */

export interface MessageListParams {
  page?: number;
  limit?: number;
  after?: string;
  before?: string;
}

export interface SendMessageInput {
  body: string;
  client_message_id?: string;
  reply_to_message_id?: string;
}

// --- JSON Schemas ---

export const messageListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
    after: { type: 'string', format: 'uuid' },
    before: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const sendMessageSchema = {
  type: 'object',
  required: ['body'],
  properties: {
    body: { type: 'string', minLength: 1, maxLength: 5000 },
    client_message_id: { type: 'string', format: 'uuid' },
    reply_to_message_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const conversationIdParamSchema = {
  type: 'object',
  required: ['conversationId'],
  properties: {
    conversationId: { type: 'string', format: 'uuid' },
  },
};

export const messageIdParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
};
