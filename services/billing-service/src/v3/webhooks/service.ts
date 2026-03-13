/**
 * Webhooks V3 Service - Health monitoring
 *
 * Actual Stripe event processing stays in V2 WebhookServiceV2 (950+ lines, Stripe-coupled).
 * V3 exposes monitoring endpoints only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { WebhookRepository } from './repository';

export class WebhookService {
  constructor(private repository: WebhookRepository, private supabase: SupabaseClient) {}

  async getHealth() {
    return this.repository.getHealthStatus();
  }
}
