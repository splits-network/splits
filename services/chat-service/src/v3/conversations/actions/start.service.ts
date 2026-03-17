/**
 * Start Action Service
 *
 * Creates or finds a conversation with representation routing and context access.
 * Ported from V2 ChatServiceV2.createOrFindConversation.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError } from '@splits-network/shared-fastify';
import { StartActionRepository } from './start.repository';
import { IEventPublisher } from '../../../v2/shared/events';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { assertContextAccess } from '../lib/context-access';

interface StartInput {
  participantUserId: string;
  context?: {
    application_id?: string | null;
    job_id?: string | null;
    company_id?: string | null;
  };
}

export class StartActionService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: StartActionRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private chatEventPublisher?: IChatEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async start(input: StartInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }
    const senderId = context.identityUserId;

    if (!input.participantUserId || input.participantUserId === senderId) {
      throw new BadRequestError('Invalid participant user id');
    }

    await assertContextAccess(this.supabase, context, input.context);

    // Representation routing
    let resolvedParticipantUserId = input.participantUserId;
    let candidateId: string | null = null;
    let routingOccurred = false;
    let candidateName: string | null = null;
    let recruiterName: string | null = null;

    const routing = await this.repository.resolveRepresentation(input.participantUserId, senderId);
    if (routing.routed && routing.recruiterUserId) {
      resolvedParticipantUserId = routing.recruiterUserId;
      candidateId = routing.candidateId;
      candidateName = routing.candidateName;
      recruiterName = routing.recruiterName;
      routingOccurred = true;

      if (resolvedParticipantUserId === senderId) {
        throw new BadRequestError('Cannot start a conversation with yourself');
      }
    }

    const conversationContext = {
      application_id: input.context?.application_id,
      job_id: input.context?.job_id,
      company_id: input.context?.company_id,
      candidate_id: candidateId,
    };

    // Normalize participant order
    const [a, b] = senderId < resolvedParticipantUserId
      ? [senderId, resolvedParticipantUserId]
      : [resolvedParticipantUserId, senderId];

    const existing = await this.repository.findConversation(a, b, conversationContext);
    if (existing) return existing;

    const conversation = await this.repository.createConversation(a, b, conversationContext);

    await this.repository.ensureParticipants(conversation.id, [
      { user_id: senderId, request_state: 'accepted' },
      { user_id: resolvedParticipantUserId, request_state: 'pending' },
    ]);

    await this.chatEventPublisher?.conversationRequested(resolvedParticipantUserId, {
      conversationId: conversation.id,
      requestedBy: senderId,
    });

    if (routingOccurred) {
      const systemBody = `This conversation was routed to ${recruiterName || 'the representing recruiter'} who represents ${candidateName || 'this candidate'}.`;
      const systemMessage = await this.repository.insertSystemMessage(conversation.id, senderId, systemBody);

      await this.repository.updateMessageMetadata(systemMessage.id, {
        routing: {
          original_participant_user_id: input.participantUserId,
          resolved_participant_user_id: resolvedParticipantUserId,
          candidate_id: candidateId,
          candidate_name: candidateName,
          recruiter_name: recruiterName,
        },
      });

      await this.repository.updateConversationLastMessage(conversation.id, systemMessage);
    }

    await this.eventPublisher?.publish('conversation.created', {
      conversation_id: conversation.id,
      created_by: senderId,
      participant_user_id: resolvedParticipantUserId,
      routing_occurred: routingOccurred,
    }, 'chat-service');

    return conversation;
  }
}
