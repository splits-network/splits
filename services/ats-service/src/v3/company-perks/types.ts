/**
 * Company Perks V3 Types & JSON Schemas
 *
 * Junction table linking companies to perks.
 */

export interface CreateCompanyPerkInput {
  company_id: string;
  perk_id: string;
}

export interface CompanyPerkListParams {
  company_id: string;
}

export interface BulkReplaceCompanyPerksInput {
  perks: Array<{ perk_id: string }>;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  required: ['company_id'],
  properties: {
    company_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['company_id', 'perk_id'],
  properties: {
    company_id: { type: 'string', format: 'uuid' },
    perk_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const bulkReplaceSchema = {
  type: 'object',
  required: ['perks'],
  properties: {
    perks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['perk_id'],
        properties: {
          perk_id: { type: 'string', format: 'uuid' },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

export const companyIdParamSchema = {
  type: 'object',
  required: ['companyId'],
  properties: {
    companyId: { type: 'string', format: 'uuid' },
  },
};

export const deleteParamSchema = {
  type: 'object',
  required: ['companyId', 'perkId'],
  properties: {
    companyId: { type: 'string', format: 'uuid' },
    perkId: { type: 'string', format: 'uuid' },
  },
};
