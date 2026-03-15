/**
 * Messaging Counters V3 Service — Business Logic
 *
 * Read-only access to messaging initiation counters.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, BadRequestError } from '@splits-network/shared-fastify';
import { MessagingCounterRepository } from './repository';
import { MessagingCounterListParams } from './types';

export class MessagingCounterService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: MessagingCounterRepository,
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

  async getAll(params: MessagingCounterListParams, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const { data, total } = await this.repository.findAll(params, userId);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const counter = await this.repository.findById(id);
    if (!counter) throw new NotFoundError('MessagingCounter', id);
    // Users can only see their own counters
    if (counter.user_id !== userId) {
      throw new NotFoundError('MessagingCounter', id);
    }
    return counter;
  }

  async getCurrentStatus(clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const count = await this.repository.getCurrentMonthCount(userId);
    return { user_id: userId, current_month_count: count };
  }
}
