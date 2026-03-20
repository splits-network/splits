/**
 * Subscriptions V3 Types — Interfaces & JSON Schemas
 */

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
export type BillingPeriod = 'monthly' | 'annual';

export interface SubscriptionListParams {
  page?: number;
  limit?: number;
  user_id?: string;
  plan_id?: string;
  status?: SubscriptionStatus;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateSubscriptionInput {
  user_id?: string;
  plan_id: string;
  recruiter_id?: string | null;
  billing_period?: BillingPeriod;
  promotion_code?: string;
}

export interface UpdateSubscriptionInput {
  plan_id?: string;
  billing_period?: BillingPeriod;
  status?: SubscriptionStatus;
  payment_method_id?: string;
  customer_id?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at?: string;
  canceled_at?: string;
  promotion_code?: string;
}

export interface SetupIntentRequest {
  plan_id?: string;
  promotion_code?: string;
}

export interface ActivateSubscriptionRequest {
  plan_id: string;
  payment_method_id?: string;
  customer_id?: string;
  billing_period?: BillingPeriod;
  promotion_code?: string;
}

export interface UpdatePaymentMethodRequest {
  payment_method_id: string;
}

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    user_id: { type: 'string' },
    plan_id: { type: 'string' },
    status: { type: 'string', enum: ['active', 'past_due', 'canceled', 'trialing', 'incomplete'] },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['plan_id'],
  properties: {
    plan_id: { type: 'string' },
    user_id: { type: 'string' },
    recruiter_id: { type: 'string' },
    billing_period: { type: 'string', enum: ['monthly', 'annual'] },
    promotion_code: { type: 'string' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    plan_id: { type: 'string' },
    billing_period: { type: 'string', enum: ['monthly', 'annual'] },
    status: { type: 'string', enum: ['active', 'past_due', 'canceled', 'trialing', 'incomplete'] },
    payment_method_id: { type: 'string' },
    customer_id: { type: 'string' },
    promotion_code: { type: 'string' },
  },
  additionalProperties: false,
};

export const setupIntentSchema = {
  type: 'object',
  properties: {
    plan_id: { type: 'string' },
    promotion_code: { type: 'string' },
  },
  additionalProperties: false,
};

export const activateSchema = {
  type: 'object',
  required: ['plan_id'],
  properties: {
    plan_id: { type: 'string' },
    payment_method_id: { type: 'string' },
    customer_id: { type: 'string' },
    billing_period: { type: 'string', enum: ['monthly', 'annual'] },
    promotion_code: { type: 'string' },
  },
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

export const invoicesQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100 },
  },
  additionalProperties: false,
};

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
