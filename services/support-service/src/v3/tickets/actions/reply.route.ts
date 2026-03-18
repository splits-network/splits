/**
 * Admin Ticket Reply Action
 * POST /api/v3/tickets/:id/actions/reply
 *
 * Admin replies to a support ticket. Creates a reply record
 * in support_ticket_replies and publishes an event.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events';
import { idParamSchema, replySchema } from '../types';

export function registerTicketReplyAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  app.post('/api/v3/tickets/:id/actions/reply', {
    schema: { params: idParamSchema, body: replySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const { body: replyBody } = request.body as { body: string };

    // Verify ticket exists
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('id, status')
      .eq('id', id)
      .maybeSingle();

    if (ticketError) throw ticketError;
    if (!ticket) throw new NotFoundError('Ticket', id);

    // Create reply
    const { data: ticketReply, error: replyError } = await supabase
      .from('support_ticket_replies')
      .insert({
        ticket_id: id,
        admin_clerk_user_id: clerkUserId,
        body: replyBody,
      })
      .select()
      .single();

    if (replyError) throw replyError;

    // Update ticket status to in_progress if currently open
    if (ticket.status === 'open') {
      await supabase
        .from('support_tickets')
        .update({ status: 'in_progress' })
        .eq('id', id);
    }

    if (eventPublisher) {
      await eventPublisher.publish('support_ticket.replied', {
        ticket_id: id,
        reply_id: ticketReply.id,
        admin_clerk_user_id: clerkUserId,
      }, 'support-service');
    }

    return reply.code(201).send({ data: ticketReply });
  });
}
