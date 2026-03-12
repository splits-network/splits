import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { SupportTicket, SupportTicketReply, SupportTicketStatus, CreateTicketInput } from './types';

export class TicketRepository {
    constructor(private supabase: SupabaseClient) {}

    async createTicket(input: CreateTicketInput): Promise<SupportTicket> {
        let userId: string | null = null;
        let visitorName = input.visitorName || null;
        let visitorEmail = input.visitorEmail || null;

        if (input.clerkUserId) {
            try {
                const ctx = await resolveAccessContext(this.supabase, input.clerkUserId);
                userId = ctx.identityUserId || null;

                if (userId && (!visitorName || !visitorEmail)) {
                    const { data: user } = await this.supabase
                        .from('users')
                        .select('name, email')
                        .eq('id', userId)
                        .single();
                    if (user) {
                        visitorName = visitorName || user.name || null;
                        visitorEmail = visitorEmail || user.email || null;
                    }
                }
            } catch {
                // Anonymous fallback
            }
        }

        const { data, error } = await this.supabase
            .from('support_tickets')
            .insert({
                visitor_session_id: input.sessionId,
                clerk_user_id: input.clerkUserId || null,
                user_id: userId,
                visitor_name: visitorName,
                visitor_email: visitorEmail,
                source_app: input.sourceApp,
                category: input.category,
                subject: input.subject || null,
                body: input.body,
                page_url: input.pageUrl || null,
                user_agent: input.userAgent || null,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create ticket: ${error.message}`);
        return data;
    }

    async getTicket(id: string): Promise<SupportTicket | null> {
        const { data, error } = await this.supabase
            .from('support_tickets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    }

    async findVisitorTickets(
        sessionId?: string,
        clerkUserId?: string,
    ): Promise<SupportTicket[]> {
        let query = this.supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (clerkUserId) {
            query = query.eq('clerk_user_id', clerkUserId);
        } else if (sessionId) {
            query = query.eq('visitor_session_id', sessionId);
        } else {
            return [];
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to list tickets: ${error.message}`);
        return data || [];
    }

    async listAllTickets(filters: {
        status?: SupportTicketStatus;
        category?: string;
        limit: number;
        page: number;
        search?: string;
    }): Promise<{ data: SupportTicket[]; total: number }> {
        const offset = (filters.page - 1) * filters.limit;

        let query = this.supabase
            .from('support_tickets')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + filters.limit - 1);

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.category) {
            query = query.eq('category', filters.category);
        }

        if (filters.search) {
            query = query.or(
                `subject.ilike.%${filters.search}%,body.ilike.%${filters.search}%,visitor_name.ilike.%${filters.search}%,visitor_email.ilike.%${filters.search}%`,
            );
        }

        const { data, count, error } = await query;
        if (error) throw new Error(`Failed to list tickets: ${error.message}`);
        return { data: data || [], total: count || 0 };
    }

    async updateTicket(
        id: string,
        updates: Partial<Pick<SupportTicket, 'status' | 'assigned_admin_id' | 'admin_notes' | 'resolved_at'>>,
    ): Promise<SupportTicket> {
        const { data, error } = await this.supabase
            .from('support_tickets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update ticket: ${error.message}`);
        return data;
    }

    async addReply(
        ticketId: string,
        senderType: 'admin' | 'system',
        senderId: string | null,
        body: string,
    ): Promise<SupportTicketReply> {
        const { data, error } = await this.supabase
            .from('support_ticket_replies')
            .insert({
                ticket_id: ticketId,
                sender_type: senderType,
                sender_id: senderId,
                body,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to add reply: ${error.message}`);
        return data;
    }

    async listReplies(ticketId: string): Promise<SupportTicketReply[]> {
        const { data, error } = await this.supabase
            .from('support_ticket_replies')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (error) throw new Error(`Failed to list replies: ${error.message}`);
        return data || [];
    }

    async claimTicket(id: string, adminClerkUserId: string): Promise<SupportTicket> {
        const ctx = await resolveAccessContext(this.supabase, adminClerkUserId);
        return this.updateTicket(id, {
            assigned_admin_id: ctx.identityUserId || undefined,
            status: 'in_progress',
        });
    }

    async getTicketCounts(): Promise<Record<string, number>> {
        const statuses: SupportTicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
        const counts: Record<string, number> = {};

        for (const status of statuses) {
            const { count } = await this.supabase
                .from('support_tickets')
                .select('*', { count: 'exact', head: true })
                .eq('status', status);
            counts[status] = count || 0;
        }

        return counts;
    }
}
