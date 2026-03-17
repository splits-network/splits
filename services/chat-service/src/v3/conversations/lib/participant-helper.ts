/**
 * Participant Helper
 *
 * Shared utilities for action services that need participant-based auth.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, ForbiddenError } from '@splits-network/shared-fastify';

export async function resolveAndValidateParticipant(
  supabase: SupabaseClient,
  clerkUserId: string,
  conversationId: string,
): Promise<{ userId: string; participant: any }> {
  const accessResolver = new AccessContextResolver(supabase);
  const context = await accessResolver.resolve(clerkUserId);
  if (!context.identityUserId) {
    throw new BadRequestError('User identity not found');
  }

  const { data: participant, error } = await supabase
    .from('chat_conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', context.identityUserId)
    .maybeSingle();

  if (error) throw error;
  if (!participant) {
    throw new ForbiddenError('Conversation access denied');
  }

  return { userId: context.identityUserId, participant };
}

export async function findOtherParticipant(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
): Promise<any | null> {
  const { data, error } = await supabase
    .from('chat_conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .neq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
