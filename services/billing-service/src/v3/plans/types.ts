/**
 * Plans V3 Types — Interfaces & JSON Schemas
 */

export type BillingInterval = 'monthly' | 'annual';
export type PlanStatus = 'active' | 'archived';
export type PlanTier = 'starter' | 'pro' | 'partner';

export interface PlanListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PlanStatus;
  tier?: PlanTier;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreatePlanInput {
  name: string;
  slug: string;
  tier: PlanTier;
  description?: string;
  price_monthly: number;
  price_annual: number;
  price_cents: number;
  currency?: string;
  billing_interval?: BillingInterval;
  features?: Record<string, any>;
  stripe_product_id?: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_annual?: string;
  trial_days?: number;
  is_active?: boolean;
}

export interface UpdatePlanInput {
  name?: string;
  slug?: string;
  tier?: PlanTier;
  description?: string;
  price_monthly?: number;
  price_annual?: number;
  price_cents?: number;
  currency?: string;
  billing_interval?: BillingInterval;
  features?: Record<string, any>;
  stripe_product_id?: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_annual?: string;
  trial_days?: number;
  is_active?: boolean;
}

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    search: { type: 'string' },
    status: { type: 'string', enum: ['active', 'archived'] },
    tier: { type: 'string', enum: ['starter', 'pro', 'partner'] },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: false,
};

export const createSchema = {
  type: 'object',
  required: ['name', 'slug', 'tier', 'price_monthly', 'price_annual', 'price_cents'],
  properties: {
    name: { type: 'string', minLength: 1 },
    slug: { type: 'string', minLength: 1 },
    tier: { type: 'string', enum: ['starter', 'pro', 'partner'] },
    description: { type: 'string' },
    price_monthly: { type: 'number', minimum: 0 },
    price_annual: { type: 'number', minimum: 0 },
    price_cents: { type: 'number', minimum: 0 },
    currency: { type: 'string' },
    billing_interval: { type: 'string', enum: ['monthly', 'annual'] },
    features: { type: 'object' },
    stripe_product_id: { type: 'string' },
    stripe_price_id_monthly: { type: 'string' },
    stripe_price_id_annual: { type: 'string' },
    trial_days: { type: 'integer', minimum: 0 },
    is_active: { type: 'boolean' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    slug: { type: 'string', minLength: 1 },
    tier: { type: 'string', enum: ['starter', 'pro', 'partner'] },
    description: { type: 'string' },
    price_monthly: { type: 'number', minimum: 0 },
    price_annual: { type: 'number', minimum: 0 },
    price_cents: { type: 'number', minimum: 0 },
    currency: { type: 'string' },
    billing_interval: { type: 'string', enum: ['monthly', 'annual'] },
    features: { type: 'object' },
    stripe_product_id: { type: 'string' },
    stripe_price_id_monthly: { type: 'string' },
    stripe_price_id_annual: { type: 'string' },
    trial_days: { type: 'integer', minimum: 0 },
    is_active: { type: 'boolean' },
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
