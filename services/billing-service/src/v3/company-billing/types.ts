/**
 * Company Billing V3 Types — Interfaces & JSON Schemas
 */

export interface CompanyBillingCreateInput {
  company_id: string;
  billing_email: string;
  billing_terms: 'immediate' | 'net_30' | 'net_60' | 'net_90';
  invoice_delivery_method?: 'email' | 'none';
  billing_contact_name?: string;
  billing_address?: Record<string, any>;
}

export interface CompanyBillingUpdateInput {
  billing_email?: string;
  billing_terms?: 'immediate' | 'net_30' | 'net_60' | 'net_90';
  invoice_delivery_method?: 'email' | 'none';
  billing_contact_name?: string;
  billing_address?: Record<string, any>;
}

export const companyIdParamSchema = {
  type: 'object',
  required: ['companyId'],
  properties: {
    companyId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const createSchema = {
  type: 'object',
  required: ['company_id', 'billing_email', 'billing_terms'],
  properties: {
    company_id: { type: 'string' },
    billing_email: { type: 'string' },
    billing_terms: { type: 'string', enum: ['immediate', 'net_30', 'net_60', 'net_90'] },
    invoice_delivery_method: { type: 'string', enum: ['email', 'none'] },
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
    invoice_delivery_method: { type: 'string', enum: ['email', 'none'] },
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
