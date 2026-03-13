/**
 * Support Tickets V3 Types & JSON Schemas
 *
 * Tables: support_tickets, support_ticket_replies
 * Async ticket support with admin workflow.
 */

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketListParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  category?: string;
  search?: string;
}

export interface CreateTicketInput {
  session_id: string;
  category?: string;
  subject?: string;
  body: string;
  visitor_name?: string;
  visitor_email?: string;
  source_app?: string;
  page_url?: string;
  user_agent?: string;
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  admin_notes?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'] },
    category: { type: 'string' },
    search: { type: 'string' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['session_id', 'body'],
  properties: {
    session_id: { type: 'string', minLength: 1, maxLength: 100 },
    category: { type: 'string', maxLength: 100 },
    subject: { type: 'string', maxLength: 500 },
    body: { type: 'string', minLength: 1, maxLength: 10000 },
    visitor_name: { type: 'string', maxLength: 200 },
    visitor_email: { type: 'string', format: 'email' },
    source_app: { type: 'string', maxLength: 50 },
    page_url: { type: 'string', maxLength: 2000 },
    user_agent: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'] },
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

export const replySchema = {
  type: 'object',
  required: ['body'],
  properties: {
    body: { type: 'string', minLength: 1, maxLength: 5000 },
  },
  additionalProperties: false,
};
