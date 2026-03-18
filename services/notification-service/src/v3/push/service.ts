/**
 * Push Subscription V3 Service — Business Logic
 *
 * Manages push subscription lifecycle. No HTTP concepts.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError } from '@splits-network/shared-fastify';
import { PushSubscriptionRepository } from './repository';
import { PushSubscriptionInput, PushSubscriptionRecord } from './types';

export class PushSubscriptionService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: PushSubscriptionRepository,
    private supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async resolveUserId(clerkUserId: string): Promise<string> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }
    return context.identityUserId;
  }

  async subscribe(
    input: PushSubscriptionInput,
    clerkUserId: string,
  ): Promise<PushSubscriptionRecord> {
    const userId = await this.resolveUserId(clerkUserId);
    return this.repository.upsert(
      userId,
      input.endpoint,
      input.keys.p256dh,
      input.keys.auth,
      input.userAgent,
    );
  }

  async unsubscribe(endpoint: string, clerkUserId: string): Promise<void> {
    const userId = await this.resolveUserId(clerkUserId);
    await this.repository.deleteByEndpoint(userId, endpoint);
  }

  async listSubscriptions(clerkUserId: string): Promise<PushSubscriptionRecord[]> {
    const userId = await this.resolveUserId(clerkUserId);
    return this.repository.findByUserId(userId);
  }
}
