/**
 * Firm Billing V3 Types — Interfaces & JSON Schemas
 */

export const firmIdParamSchema = {
  type: 'object',
  required: ['firmId'],
  properties: {
    firmId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const createSchema = {
  type: 'object',
  required: ['firm_id', 'billing_email', 'billing_terms'],
  properties: {
    firm_id: { type: 'string' },
    billing_email: { type: 'string' },
    billing_terms: { type: 'string', enum: ['immediate', 'net_30', 'net_60', 'net_90'] },
    invoice_delivery_method: { type: 'string', enum: ['email', 'manual'] },
    billing_contact_name: { type: 'string' },
    billing_address: { type: 'object' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    billing_email: { type: 'string' },
    billing_terms: { type: 'string', enum: ['immediate', 'net_30', 'net_60', 'net_90'] },
    invoice_delivery_method: { type: 'string', enum: ['email', 'manual'] },
    billing_contact_name: { type: 'string' },
    billing_address: { type: 'object' },
  },
  additionalProperties: false,
};

export const setupIntentSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
};

export const updatePaymentMethodSchema = {
  type: 'object',
  required: ['payment_method_id'],
  properties: {
    payment_method_id: { type: 'string' },
  },
  additionalProperties: false,
};
