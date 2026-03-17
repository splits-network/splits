/**
 * Blocks V3 Service -- Core CRUD Business Logic
 *
 * Identity resolution, self-block validation, event publishing.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { BlockRepository } from './repository';
import { BlockListParams, CreateBlockInput } from './types';
import { IEventPublisher } from '../../v2/shared/events';
import { IChatEventPublisher } from '../shared/chat-event-publisher';

export class BlockService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: BlockRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private chatEventPublisher?: IChatEventPublisher,
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

  async getAll(params: BlockListParams, clerkUserId: string) {
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
    const block = await this.repository.findById(id);
    if (!block) throw new NotFoundError('Block', id);

    if (block.blocker_user_id !== userId) {
      throw new ForbiddenError('You do not have access to this block');
    }

    return block;
  }

  async create(input: CreateBlockInput, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);

    if (userId === input.blocked_user_id) {
      throw new BadRequestError('Cannot block yourself');
    }

    // Check for existing block to prevent duplicates
    const existing = await this.repository.findByBlockerAndBlocked(userId, input.blocked_user_id);
    if (existing) {
      return existing;
    }

    const block = await this.repository.create(userId, input.blocked_user_id, input.reason);

    await this.chatEventPublisher?.blockCreated(userId, {
      blockedUserId: input.blocked_user_id,
    });

    await this.eventPublisher?.publish('block.created', {
      blocker_user_id: userId,
      blocked_user_id: input.blocked_user_id,
    }, 'chat-service');

    return block;
  }

  async delete(id: string, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const block = await this.repository.findById(id);
    if (!block) throw new NotFoundError('Block', id);

    if (block.blocker_user_id !== userId) {
      throw new ForbiddenError('You do not have access to this block');
    }

    await this.repository.delete(id);

    await this.chatEventPublisher?.blockRemoved(userId, {
      blockedUserId: block.blocked_user_id,
    });

    await this.eventPublisher?.publish('block.removed', {
      blocker_user_id: userId,
      blocked_user_id: block.blocked_user_id,
    }, 'chat-service');
  }
}
