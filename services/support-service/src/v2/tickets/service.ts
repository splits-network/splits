import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { IEventPublisher } from '../shared/events';
import { SupportEventPublisher } from '../support/events';
import { TicketRepository } from './repository';
import {
    CreateTicketInput,
    SupportTicket,
    SupportTicketReply,
    SupportTicketStatus,
} from './types';

export class TicketService {
    constructor(
        private repository: TicketRepository,
        private eventPublisher: IEventPublisher | null,
        private realtimePublisher: SupportEventPublisher,
        private supabase: SupabaseClient,
    ) {}

    async createTicket(input: CreateTicketInput): Promise<SupportTicket> {
        const ticket = await this.repository.createTicket(input);

        // Publish domain event for notification-service
        if (this.eventPublisher) {
            await this.eventPublisher.publish('support_ticket.created', {
                ticket_id: ticket.id,
                category: ticket.category,
                subject: ticket.subject,
                body: ticket.body,
                visitor_name: ticket.visitor_name,
                visitor_email: ticket.visitor_email,
                source_app: ticket.source_app,
            });
        }

        // Notify admins in real-time
        await this.realtimePublisher.publishToAdminQueue({
            type: 'support.ticket.new',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { ticket },
        });

        return ticket;
    }

    async getTicket(id: string): Promise<SupportTicket | null> {
        return this.repository.getTicket(id);
    }

    async getTicketWithReplies(id: string): Promise<{
        ticket: SupportTicket;
        replies: SupportTicketReply[];
    } | null> {
        const ticket = await this.repository.getTicket(id);
        if (!ticket) return null;

        const replies = await this.repository.listReplies(id);
        return { ticket, replies };
    }

    async getVisitorTickets(
        sessionId?: string,
        clerkUserId?: string,
    ): Promise<SupportTicket[]> {
        return this.repository.findVisitorTickets(sessionId, clerkUserId);
    }

    async listAllTickets(filters: {
        status?: SupportTicketStatus;
        category?: string;
        limit: number;
        page: number;
        search?: string;
    }): Promise<{ data: SupportTicket[]; total: number }> {
        return this.repository.listAllTickets(filters);
    }

    async replyToTicket(
        ticketId: string,
        adminClerkUserId: string,
        body: string,
    ): Promise<SupportTicketReply> {
        const ticket = await this.repository.getTicket(ticketId);
        if (!ticket) {
            const error = new Error('Ticket not found') as any;
            error.statusCode = 404;
            throw error;
        }

        const ctx = await resolveAccessContext(this.supabase, adminClerkUserId);
        const reply = await this.repository.addReply(
            ticketId,
            'admin',
            ctx.identityUserId || null,
            body,
        );

        // Auto-advance status from open to in_progress
        if (ticket.status === 'open') {
            await this.repository.updateTicket(ticketId, { status: 'in_progress' });
        }

        // Publish domain event for email notification
        if (this.eventPublisher) {
            await this.eventPublisher.publish('support_ticket.replied', {
                ticket_id: ticket.id,
                reply_id: reply.id,
                reply_body: reply.body,
                ticket_subject: ticket.subject,
                ticket_category: ticket.category,
                visitor_name: ticket.visitor_name,
                visitor_email: ticket.visitor_email,
                source_app: ticket.source_app,
            });
        }

        // Notify admins in real-time
        await this.realtimePublisher.publishToAdminQueue({
            type: 'support.ticket.replied',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { ticket, reply },
        });

        return reply;
    }

    async updateTicketStatus(
        id: string,
        status: SupportTicketStatus,
    ): Promise<SupportTicket> {
        const updates: any = { status };
        if (status === 'resolved') {
            updates.resolved_at = new Date().toISOString();
        }
        return this.repository.updateTicket(id, updates);
    }

    async updateTicketNotes(
        id: string,
        adminNotes: string,
    ): Promise<SupportTicket> {
        return this.repository.updateTicket(id, { admin_notes: adminNotes });
    }

    async claimTicket(
        id: string,
        adminClerkUserId: string,
    ): Promise<SupportTicket> {
        return this.repository.claimTicket(id, adminClerkUserId);
    }

    async getTicketCounts(): Promise<Record<string, number>> {
        return this.repository.getTicketCounts();
    }
}
