import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { SupportEmailService } from '../../services/support/service';

const DEFAULT_RECIPIENTS = [
    'help@applicant.network',
    'help@splits.network',
    'help@employment-networks.com',
];

export class SupportEventConsumer {
    private recipients: string[];

    constructor(
        private supportService: SupportEmailService,
        private logger: Logger
    ) {
        this.recipients = (process.env.STATUS_CONTACT_RECIPIENTS || DEFAULT_RECIPIENTS.join(','))
            .split(',')
            .map((email) => email.trim())
            .filter(Boolean);
    }

    async handleStatusContact(event: DomainEvent): Promise<void> {
        if (!this.recipients.length) {
            this.logger.warn('No STATUS_CONTACT_RECIPIENTS configured; skipping status contact email.');
            return;
        }

        const payload = event.payload || {};

        const baseData = {
            name: (payload.name as string) || 'Unknown',
            email: (payload.email as string) || 'unknown',
            topic: (payload.topic as string) || 'general',
            urgency: (payload.urgency as string) || 'normal',
            message: (payload.message as string) || '',
            source: (payload.source as string) || 'status-page',
            submittedAt: (payload.submitted_at as string) || new Date().toISOString(),
            ipAddress: (payload.ip_address as string) || undefined,
            userAgent: (payload.user_agent as string) || undefined,
        };

        for (const recipient of this.recipients) {
            await this.supportService.sendStatusContactEmail({
                recipient,
                ...baseData,
            });
        }
    }

    async handleTicketReplied(event: DomainEvent): Promise<void> {
        const payload = event.payload || {};
        const ticket = payload.ticket as Record<string, any> | undefined;
        const reply = payload.reply as Record<string, any> | undefined;

        if (!ticket || !reply) {
            this.logger.warn({ payload }, 'support_ticket.replied event missing ticket or reply');
            return;
        }

        const visitorEmail = ticket.visitor_email as string;
        if (!visitorEmail) {
            this.logger.info({ ticketId: ticket.id }, 'No visitor email on ticket; skipping reply notification');
            return;
        }

        const sourceApp = (ticket.source_app as string) || 'portal';

        await this.supportService.sendTicketReplyEmail({
            recipientEmail: visitorEmail,
            visitorName: (ticket.visitor_name as string) || undefined,
            ticketSubject: (ticket.subject as string) || undefined,
            ticketBody: (ticket.body as string) || '',
            replyBody: (reply.body as string) || '',
            ticketId: ticket.id as string,
            sourceApp: sourceApp as 'portal' | 'candidate' | 'corporate',
            userId: (ticket.user_id as string) || undefined,
        });
    }
}
