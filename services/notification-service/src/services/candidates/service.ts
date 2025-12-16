import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';

export class CandidatesEmailService {
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

    async sendCandidateSourced(
        recipientEmail: string,
        data: {
            candidateName: string;
            sourceMethod: string;
            protectionPeriod: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Candidate Sourced: ${data.candidateName}`;
        const html = `
      <h2>✅ Candidate Successfully Sourced</h2>
      <p>You have successfully claimed sourcing ownership for a candidate.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Source Method:</strong> ${data.sourceMethod}</li>
        <li><strong>Protection Period:</strong> ${data.protectionPeriod}</li>
      </ul>
      <p>You now have exclusive rights to work with this candidate. Other recruiters will be notified if they attempt to source the same candidate.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'candidate.sourced',
            userId: data.userId,
            payload: data,
        });
    }

    async sendOwnershipConflict(
        recipientEmail: string,
        data: {
            candidateName: string;
            attemptingRecruiterName: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Ownership Conflict Detected: ${data.candidateName}`;
        const html = `
      <h2>⚠️ Another Recruiter Attempted to Source Your Candidate</h2>
      <p>Another recruiter has attempted to claim sourcing ownership for a candidate you already sourced.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Attempting Recruiter:</strong> ${data.attemptingRecruiterName}</li>
      </ul>
      <p>Your ownership protection remains in place. The other recruiter has been informed that you have prior claim.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'ownership.conflict_detected',
            userId: data.userId,
            payload: data,
        });
    }

    async sendOwnershipConflictRejection(
        recipientEmail: string,
        data: {
            candidateName: string;
            originalSourcerName: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Candidate Already Claimed: ${data.candidateName}`;
        const html = `
      <h2>❌ Candidate Already Claimed</h2>
      <p>The candidate you attempted to source has already been claimed by another recruiter.</p>
      <ul>
        <li><strong>Candidate:</strong> ${data.candidateName}</li>
        <li><strong>Original Sourcer:</strong> ${data.originalSourcerName}</li>
      </ul>
      <p>The original sourcer has protection rights to this candidate. You may collaborate with them if they add you to a placement.</p>
    `;
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'ownership.conflict_detected',
            userId: data.userId,
            payload: data,
        });
    }
}
