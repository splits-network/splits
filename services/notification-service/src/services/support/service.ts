import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';

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

export class SupportEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private logger: Logger
    ) {}

    private renderStatusContactEmail(data: StatusContactEmailData) {
        return `
            <html>
                <body style="font-family: Arial, sans-serif; color: #111827;">
                    <h2 style="color:#111827;">New Status Page Contact</h2>
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Topic:</strong> ${data.topic}</p>
                    <p><strong>Urgency:</strong> ${data.urgency}</p>
                    <p><strong>Source:</strong> ${data.source}</p>
                    <p><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
                    <p><strong>Message:</strong></p>
                    <p style="white-space:pre-line; background:#f3f4f6; padding:12px; border-radius:8px;">${data.message}</p>
                    <hr />
                    <p style="font-size:12px; color:#6b7280;">
                        IP Address: ${data.ipAddress || 'unknown'}<br/>
                        User Agent: ${data.userAgent || 'unknown'}
                    </p>
                </body>
            </html>
        `.trim();
    }

    async sendStatusContactEmail(data: StatusContactEmailData): Promise<void> {
        const subject = `[Status Contact] ${data.topic} (${data.source})`;

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
            channel: 'email',
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
}
