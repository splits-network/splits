/**
 * Webhooks V3 Types - Stripe webhook processing
 */

export interface StripeWebhookPayload {
  type: string;
  data: { object: Record<string, any> };
}
