/**
 * Placement Invoices V3 Types — Interfaces & JSON Schemas
 */

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
export type CollectionMethod = 'charge_automatically' | 'send_invoice';

export interface PlacementInvoiceListParams {
  page?: number;
  limit?: number;
  placement_id?: string;
  company_id?: string;
  firm_id?: string;
  invoice_status?: InvoiceStatus;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreatePlacementInvoiceInput {
  placement_id: string;
  company_id?: string;
  firm_id?: string;
}

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    placement_id: { type: 'string' },
    company_id: { type: 'string' },
    firm_id: { type: 'string' },
    invoice_status: { type: 'string', enum: ['draft', 'open', 'paid', 'void', 'uncollectible'] },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: false,
};

export const createSchema = {
  type: 'object',
  required: ['placement_id'],
  properties: {
    placement_id: { type: 'string' },
    company_id: { type: 'string' },
    firm_id: { type: 'string' },
  },
  additionalProperties: false,
};

export const placementIdParamSchema = {
  type: 'object',
  required: ['placementId'],
  properties: {
    placementId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const companyIdParamSchema = {
  type: 'object',
  required: ['companyId'],
  properties: {
    companyId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
