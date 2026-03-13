/**
 * Firm Connect V3 Types — Stripe Connect for firms
 */

export const onboardingLinkSchema = {
  type: 'object',
  required: ['return_url', 'refresh_url'],
  properties: {
    return_url: { type: 'string' },
    refresh_url: { type: 'string' },
  },
  additionalProperties: false,
};

export const updateFirmAccountSchema = {
  type: 'object',
  required: ['first_name', 'last_name', 'email', 'dob', 'address'],
  properties: {
    company_name: { type: 'string' },
    company_phone: { type: 'string' },
    company_tax_id: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    dob: {
      type: 'object',
      properties: {
        day: { type: 'integer' },
        month: { type: 'integer' },
        year: { type: 'integer' },
      },
    },
    ssn_last_4: { type: 'string' },
    address: {
      type: 'object',
      properties: {
        line1: { type: 'string' },
        line2: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        postal_code: { type: 'string' },
        country: { type: 'string' },
      },
    },
  },
  additionalProperties: false,
};

export const addBankAccountSchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string' },
  },
  additionalProperties: false,
};

export const firmIdParamSchema = {
  type: 'object',
  required: ['firmId'],
  properties: {
    firmId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const payoutsQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 50 },
  },
  additionalProperties: false,
};
