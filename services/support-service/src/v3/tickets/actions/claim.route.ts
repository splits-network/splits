/**
 * Admin Ticket Claim Action
 * POST /api/v3/tickets/:id/actions/claim
 *
 * Admin claims a ticket (assigns themselves).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events';
import { idParamSchema } from '../types';

export function registerTicketClaimAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  app.post('/api/v3/tickets/:id/actions/claim', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };

    const { data: ticket, error: findError } = await supabase
      .from('support_tickets')
      .select('id, status, assigned_to')
      .eq('id', id)
      .maybeSingle();

    if (findError) throw findError;
    if (!ticket) throw new NotFoundError('Ticket', id);

    const { data: updated, error: updateError } = await supabase
      .from('support_tickets')
      .update({
        assigned_to: clerkUserId,
        status: ticket.status === 'open' ? 'in_progress' : ticket.status,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    if (eventPublisher) {
      await eventPublisher.publish('support_ticket.claimed', {
        ticket_id: id,
        admin_clerk_user_id: clerkUserId,
      }, 'support-service');
    }

    return reply.send({ data: updated });
  });
}
