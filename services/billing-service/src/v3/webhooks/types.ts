/**
 * Webhooks V3 Types - Stripe webhook processing
 */

import Stripe from 'stripe';
import { Logger } from '@splits-network/shared-logging';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';

export interface StripeWebhookPayload {
  type: string;
  data: { object: Record<string, any> };
}

export interface WebhookHandlerDeps {
  supabase: SupabaseClient;
  stripe: Stripe;
  logger: Logger;
  eventPublisher: IEventPublisher;
}

export interface WebhookHandler {
  handle(eventType: string, dataObject: any): Promise<void>;
}
