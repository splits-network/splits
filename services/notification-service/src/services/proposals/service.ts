import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';

export class ProposalsEmailService {
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

    async sendProposalAccepted(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Proposal Accepted: ${data.candidateName} for ${data.jobTitle}`;
        const html = `
      <h2>✅ Your Proposal Has Been Accepted!</h2>
      <p>Good news! Your candidate proposal has been accepted by the hiring manager.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
      </ul>
      <p>You can now proceed with scheduling interviews and moving the candidate through the hiring process.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'proposal.accepted',
            userId: data.userId,
            payload: data,
        });
    }

    async sendProposalDeclined(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            declineReason: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Proposal Declined: ${data.candidateName}`;
        const html = `
      <h2>Proposal Not Accepted</h2>
      <p>Unfortunately, your candidate proposal was not accepted by the hiring manager.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Reason:</strong> ${data.declineReason}</li>
      </ul>
      <p>Don't be discouraged! Keep sourcing great candidates and submitting proposals.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'proposal.declined',
            userId: data.userId,
            payload: data,
        });
    }

    async sendProposalTimeout(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Proposal Expired: ${data.candidateName}`;
        const html = `
      <h2>⏰ Proposal Has Timed Out</h2>
      <p>Your candidate proposal has expired without a response from the hiring manager.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
      </ul>
      <p>The proposal has been automatically declined due to timeout. You may submit the candidate to other roles.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'proposal.timeout',
            userId: data.userId,
            payload: data,
        });
    }
}
