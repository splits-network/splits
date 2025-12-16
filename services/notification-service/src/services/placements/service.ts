import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';

export class PlacementsEmailService {
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

    async sendPlacementCreated(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            salary: number;
            recruiterShare: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Placement Confirmed: ${data.candidateName} - $${data.recruiterShare.toFixed(2)}`;
        const html = `
      <h2>🎉 Placement Confirmed!</h2>
      <p>Congratulations! A candidate you submitted has been hired.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Salary:</strong> $${data.salary.toLocaleString()}</li>
        <li><strong>Your Share:</strong> $${data.recruiterShare.toLocaleString()}</li>
      </ul>
      <p>Payment details will be processed according to your payout schedule.</p>
    `;

        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'placement.created',
            userId: data.userId,
            payload: data,
        });
    }

    async sendPlacementActivated(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            guaranteeDays: number;
            role: string;
            splitPercentage: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Placement Activated: ${data.candidateName} Started!`;
        const html = `
      <h2>🚀 Placement Has Started!</h2>
      <p>Great news! Your placed candidate has officially started their new role.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Your Role:</strong> ${data.role}</li>
        <li><strong>Your Split:</strong> ${data.splitPercentage}%</li>
        <li><strong>Guarantee Period:</strong> ${data.guaranteeDays} days</li>
      </ul>
      <p>The ${data.guaranteeDays}-day guarantee period is now active. Your payout will be processed after successful completion.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'placement.activated',
            userId: data.userId,
            payload: data,
        });
    }

    async sendPlacementCompleted(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            finalPayout: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `💰 Placement Completed: ${data.candidateName} - $${data.finalPayout.toFixed(2)}`;
        const html = `
      <h2>🎉 Placement Successfully Completed!</h2>
      <p>Congratulations! Your placement has successfully completed the guarantee period.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Your Final Payout:</strong> $${data.finalPayout.toLocaleString()}</li>
      </ul>
      <p>Your payment will be processed according to your payout schedule. Great work!</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'placement.completed',
            userId: data.userId,
            payload: data,
        });
    }

    async sendPlacementFailed(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            failureReason: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Placement Issue: ${data.candidateName}`;
        const html = `
      <h2>⚠️ Placement Did Not Complete</h2>
      <p>Unfortunately, this placement did not successfully complete the guarantee period.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Reason:</strong> ${data.failureReason}</li>
      </ul>
      <p>The guarantee period was not met. Please log in to review details and next steps.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'placement.failed',
            userId: data.userId,
            payload: data,
        });
    }

    async sendGuaranteeExpiring(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            daysRemaining: number;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `⏳ Guarantee Period Ending Soon: ${data.candidateName}`;
        const html = `
      <h2>⏳ Guarantee Period Reminder</h2>
      <p>The guarantee period for one of your placements is ending soon.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Role:</strong> ${data.jobTitle}</li>
        <li><strong>Company:</strong> ${data.companyName}</li>
        <li><strong>Days Remaining:</strong> ${data.daysRemaining}</li>
      </ul>
      <p>Please check in with the company and candidate to ensure everything is going well before the guarantee period expires.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'guarantee.expiring',
            userId: data.userId,
            payload: data,
        });
    }
}
