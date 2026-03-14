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
