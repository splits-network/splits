/**
 * Detail View Service
 *
 * Returns a single conversation with participant details and caller's participant state.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError, BadRequestError } from '@splits-network/shared-fastify';
import { DetailViewRepository } from './detail.repository';

export class DetailViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: DetailViewRepository,
    supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(conversationId: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }

    const participant = await this.repository.getParticipantState(conversationId, context.identityUserId);
    if (!participant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    const conversation = await this.repository.findByIdWithParticipants(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation', conversationId);
    }

    return { conversation, participant };
  }
}
