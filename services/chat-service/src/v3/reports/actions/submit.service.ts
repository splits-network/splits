/**
 * Submit Action Service
 *
 * Any authenticated user who is a participant in the conversation
 * can submit a report. Collects recent messages as evidence.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, ForbiddenError } from '@splits-network/shared-fastify';
import { SubmitActionRepository } from './submit.repository';
import { IEventPublisher } from '../../../v2/shared/events';

export interface SubmitReportInput {
  conversationId: string;
  reportedUserId: string;
  category: string;
  description?: string;
}

export class SubmitActionService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: SubmitActionRepository,
    supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async submit(input: SubmitReportInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }

    if (!input.conversationId || !input.reportedUserId || !input.category) {
      throw new BadRequestError('conversationId, reportedUserId, and category are required');
    }

    if (context.identityUserId === input.reportedUserId) {
      throw new BadRequestError('Cannot report yourself');
    }

    const isParticipant = await this.repository.isParticipant(
      input.conversationId,
      context.identityUserId,
    );
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    const messageIds = await this.repository.fetchRecentMessageIds(input.conversationId, 20);
    const evidencePointer = JSON.stringify({ message_ids: messageIds });

    const report = await this.repository.createReport({
      reporter_user_id: context.identityUserId,
      reported_user_id: input.reportedUserId,
      conversation_id: input.conversationId,
      category: input.category,
      description: input.description ?? null,
      evidence_pointer: evidencePointer,
    });

    await this.eventPublisher?.publish('report.submitted', {
      report_id: report.id,
      reporter_user_id: context.identityUserId,
      reported_user_id: input.reportedUserId,
      conversation_id: input.conversationId,
      category: input.category,
    });

    return report;
  }
}
