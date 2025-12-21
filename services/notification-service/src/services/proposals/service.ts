import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import {
    proposalAcceptedEmail,
    proposalDeclinedEmail,
    proposalTimeoutEmail,
} from '../../templates/proposals';

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
        const proposalUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/roles`;
        
        const html = proposalAcceptedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            proposalUrl,
        });
        
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
        const rolesUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/roles`;
        
        const html = proposalDeclinedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            declineReason: data.declineReason,
            rolesUrl,
        });
        
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
        const rolesUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/roles`;
        
        const html = proposalTimeoutEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            rolesUrl,
        });
        
        await this.sendEmail(recipientEmail, subject, html, {
            eventType: 'proposal.timeout',
            userId: data.userId,
            payload: data,
        });
    }
}
