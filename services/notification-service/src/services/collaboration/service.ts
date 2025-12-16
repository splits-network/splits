import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';

export class CollaborationEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private logger: Logger
    ) {}

    private async sendEmail(
        to: string,
        subject: string,
        html: string,
        options: {
            eventType: string;
            userId?: string;
            payload?: Record<string, any>;
        }
    ): Promise<void> {
        const log = await this.repository.createNotificationLog({
            event_type: options.eventType,
            recipient_user_id: options.userId,
            recipient_email: to,
            subject,
            template: 'custom',
            payload: options.payload,
            status: 'pending',
        });

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject,
                html,
            });

            if (error) {
                throw error;
            }

            await this.repository.updateNotificationLog(log.id, {
                status: 'sent',
                resend_message_id: data?.id,
            });

            this.logger.info(
                { email: to, subject, message_id: data?.id },
                'Email sent successfully'
            );
        } catch (error: any) {
            this.logger.error({ email: to, error }, 'Failed to send email');

            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error.message || 'Unknown error',
            });

            throw error;
        }
    }

    async sendCollaboratorAdded(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            role: string;
            splitPercentage: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Added to Placement Team: ${data.candidateName}`;
        const html = `
      <h2>🤝 You've Been Added as a Collaborator!</h2>
      <p>You've been added to a placement team and will receive a split of the fee.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Your Role:</strong> ${data.role}</li>
        <li><strong>Your Split:</strong> ${data.splitPercentage}%</li>
      </ul>
      <p>Log in to view full placement details and collaborate with the team.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'collaborator.added',
            userId: data.userId,
            payload: data,
        });
    }
}
