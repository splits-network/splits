import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import { baseEmailTemplate, type EmailSource } from '../../templates/base';
import { heading, paragraph, infoCard, divider } from '../../templates/components';

export interface StatusContactEmailData {
    recipient: string;
    name: string;
    email: string;
    topic: string;
    urgency: string;
    message: string;
    source: string;
    submittedAt: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface TicketReplyEmailData {
    recipientEmail: string;
    visitorName?: string;
    ticketSubject?: string;
    ticketBody: string;
    replyBody: string;
    ticketId: string;
    sourceApp: EmailSource;
    userId?: string;
}

export class SupportEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private candidateFromEmail: string,
        private logger: Logger
    ) {}

    private renderStatusContactEmail(data: StatusContactEmailData) {
        return `
            <html>
                <body style="font-family: Arial, sans-serif; color: #18181b;">
                    <h2 style="color:#18181b;">New Status Page Contact</h2>
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Topic:</strong> ${data.topic}</p>
                    <p><strong>Urgency:</strong> ${data.urgency}</p>
                    <p><strong>Source:</strong> ${data.source}</p>
                    <p><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
                    <p><strong>Message:</strong></p>
                    <p style="white-space:pre-line; background:#f4f4f5; padding:12px; border-radius:4px;">${data.message}</p>
                    <hr />
                    <p style="font-size:12px; color:#18181b;">
                        IP Address: ${data.ipAddress || 'unknown'}<br/>
                        User Agent: ${data.userAgent || 'unknown'}
                    </p>
                </body>
            </html>
        `.trim();
    }

    async sendStatusContactEmail(data: StatusContactEmailData): Promise<void> {
        const subject = `[Status Contact] ${data.topic} (${data.source})`;

        const effectiveChannel = await this.repository.resolveChannelWithPreferences(null, 'email', null);
        if (!effectiveChannel) return;

        const log = await this.repository.createNotificationLog({
            event_type: 'status.contact_submitted',
            recipient_email: data.recipient,
            subject,
            template: 'status-contact',
            payload: {
                name: data.name,
                email: data.email,
                topic: data.topic,
                urgency: data.urgency,
                source: data.source,
                submitted_at: data.submittedAt,
                ip_address: data.ipAddress,
                user_agent: data.userAgent,
            },
            channel: effectiveChannel,
            status: 'pending',
            read: false,
            dismissed: false,
            priority: 'high',
        });

        try {
            const { data: result, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to: data.recipient,
                subject,
                html: this.renderStatusContactEmail(data),
            });

            if (error) {
                throw error;
            }

            await this.repository.updateNotificationLog(log.id, {
                status: 'sent',
                resend_message_id: result?.id,
            });

            this.logger.info(
                { email: data.recipient, subject, message_id: result?.id },
                'Status contact email sent'
            );
        } catch (error: any) {
            this.logger.error({ email: data.recipient, error }, 'Failed to send status contact email');
            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error?.message || 'Unknown error',
            });
            throw error;
        }
    }

    async sendTicketReplyEmail(data: TicketReplyEmailData): Promise<void> {
        const subjectLine = data.ticketSubject
            ? `Re: ${data.ticketSubject} — Splits Network Support`
            : 'You have a reply from Splits Network Support';

        const greeting = data.visitorName ? `Hi ${data.visitorName},` : 'Hi there,';

        const content = `
${heading({ level: 1, text: 'Support Update' })}
${paragraph(greeting)}
${paragraph('Our support team has replied to your request:')}
${divider()}
${paragraph(`<div style="white-space: pre-line; line-height: 1.6;">${data.replyBody}</div>`)}
${divider()}
${infoCard({
    title: 'Your Original Message',
    items: [
        ...(data.ticketSubject ? [{ label: 'Subject', value: data.ticketSubject }] : []),
        { label: 'Message', value: data.ticketBody.length > 200 ? data.ticketBody.substring(0, 200) + '...' : data.ticketBody },
    ],
})}
${paragraph('If you need further assistance, simply reply to this email or visit our platform.')}
        `.trim();

        const html = baseEmailTemplate({
            preheader: `Support reply: ${data.replyBody.substring(0, 80)}...`,
            source: data.sourceApp,
            content,
        });

        const fromAddress = data.sourceApp === 'candidate' ? this.candidateFromEmail : this.fromEmail;

        const effectiveChannel = await this.repository.resolveChannelWithPreferences(data.userId, 'email', 'support');
        if (!effectiveChannel) return;

        const log = await this.repository.createNotificationLog({
            event_type: 'support_ticket.replied',
            recipient_user_id: data.userId || undefined,
            recipient_email: data.recipientEmail,
            subject: subjectLine,
            template: 'support-ticket-reply',
            payload: {
                ticket_id: data.ticketId,
                reply_body: data.replyBody,
                source_app: data.sourceApp,
            },
            channel: effectiveChannel,
            status: 'pending',
            read: false,
            dismissed: false,
            priority: 'normal',
            category: 'support',
        });

        try {
            const { data: result, error } = await this.resend.emails.send({
                from: fromAddress,
                to: data.recipientEmail,
                subject: subjectLine,
                html,
            });

            if (error) {
                throw error;
            }

            await this.repository.updateNotificationLog(log.id, {
                status: 'sent',
                resend_message_id: result?.id,
            });

            this.logger.info(
                { email: data.recipientEmail, ticketId: data.ticketId, message_id: result?.id },
                'Support ticket reply email sent'
            );
        } catch (error: any) {
            this.logger.error(
                { email: data.recipientEmail, ticketId: data.ticketId, error },
                'Failed to send ticket reply email'
            );
            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error?.message || 'Unknown error',
            });
            throw error;
        }
    }
}
