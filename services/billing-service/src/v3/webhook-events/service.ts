/**
 * Webhook Events V3 Service - Admin read-only
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { WebhookEventRepository } from './repository.js';

export class WebhookEventService {
  private accessResolver: AccessContextResolver;
  constructor(private repository: WebhookEventRepository, private supabase: SupabaseClient) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async list(params: { page?: number; limit?: number; status?: string; event_type?: string }, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const { data, total } = await this.repository.list(params);
    const p = params.page || 1, l = params.limit || 25;
    return { data, pagination: { total, page: p, limit: l, total_pages: Math.ceil(total / l) } };
  }
}
