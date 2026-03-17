/**
 * Messaging Counters V3 Types & JSON Schemas
 *
 * Table: messaging_initiation_counters
 * Rate limiting for message initiations per billing period.
 */

export interface MessagingCounterListParams {
  page?: number;
  limit?: number;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
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
