/**
 * Discounts V3 Types — Interfaces & JSON Schemas
 */

export interface DiscountValidationRequest {
  code: string;
  plan_id: string;
  billing_period: 'monthly' | 'annual';
}

export interface ApplyDiscountRequest {
  subscription_id: string;
  promotion_code: string;
}

export const validateSchema = {
  type: 'object',
  required: ['code', 'plan_id', 'billing_period'],
  properties: {
    code: { type: 'string', minLength: 1 },
    plan_id: { type: 'string' },
    billing_period: { type: 'string', enum: ['monthly', 'annual'] },
  },
  additionalProperties: false,
};

export const subscriptionIdParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
