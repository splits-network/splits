/**
 * Support Conversations V3 Types & JSON Schemas
 *
 * Tables: support_conversations, support_messages
 * Visitor-initiated live chat support.
 */

export interface SupportConversationListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface CreateSupportConversationInput {
  session_id: string;
  visitor_name?: string;
  visitor_email?: string;
  source_app?: string;
  initial_message?: string;
}

export interface UpdateSupportConversationInput {
  status?: string;
  admin_notes?: string;
}

export interface SendSupportMessageInput {
  body: string;
  sender_type?: 'visitor' | 'admin' | 'system';
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    status: { type: 'string' },
    search: { type: 'string' },
  },
};

export const createSchema = {
  type: 'object',
  required: ['session_id'],
  properties: {
    session_id: { type: 'string', minLength: 1, maxLength: 100 },
    visitor_name: { type: 'string', maxLength: 200 },
    visitor_email: { type: 'string', format: 'email' },
    source_app: { type: 'string', maxLength: 50 },
    initial_message: { type: 'string', maxLength: 5000 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', maxLength: 50 },
    admin_notes: { type: 'string', maxLength: 5000 },
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
    sender_type: { type: 'string', enum: ['visitor', 'admin', 'system'] },
  },
  additionalProperties: false,
};
