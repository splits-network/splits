/**
 * Connect V3 Types — Stripe Connect for individual recruiters
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

export const updateAccountSchema = {
  type: 'object',
  required: ['first_name', 'last_name', 'email', 'phone', 'dob', 'ssn_last_4', 'address'],
  properties: {
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
        city: { type: 'string' },
        state: { type: 'string' },
        postal_code: { type: 'string' },
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

export const payoutsQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 50 },
  },
  additionalProperties: false,
};
