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

    /**
     * Send email notification (creates record with channel='email')
     */
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
            channel: 'email',
            status: 'pending',
            read: false,
            dismissed: false,
            priority: 'normal',
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

    /**
     * Create in-app notification (creates record with channel='in_app')
     */
    private async createInAppNotification(options: {
        userId: string;
        email: string;
        subject: string;
        eventType: string;
        actionUrl?: string;
        actionLabel?: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        category?: string;
        payload?: Record<string, any>;
    }): Promise<void> {
        try {
            await this.repository.createNotificationLog({
                event_type: options.eventType,
                recipient_user_id: options.userId,
                recipient_email: options.email,
                subject: options.subject,
                template: 'in_app',
                payload: options.payload,
                channel: 'in_app',
                status: 'sent',
                read: false,
                dismissed: false,
                action_url: options.actionUrl,
                action_label: options.actionLabel,
                priority: options.priority || 'normal',
                category: options.category || 'proposal',
            });

            this.logger.info(
                { userId: options.userId, subject: options.subject },
                'In-app notification created'
            );
        } catch (error: any) {
            this.logger.error({ userId: options.userId, error }, 'Failed to create in-app notification');
            // Don't throw - we don't want in-app notification failure to break email sending
        }
    }

    /**
     * Send dual notification: email + in-app
     */
    private async sendDualNotification(
        to: string,
        subject: string,
        html: string,
        options: {
            eventType: string;
            userId?: string;
            payload?: Record<string, any>;
            actionUrl?: string;
            actionLabel?: string;
            priority?: 'low' | 'normal' | 'high' | 'urgent';
            category?: string;
        }
    ): Promise<void> {
        // Send email first (primary channel)
        await this.sendEmail(to, subject, html, {
            eventType: options.eventType,
            userId: options.userId,
            payload: options.payload,
        });

        // Create in-app notification (secondary channel)
        if (options.userId) {
            await this.createInAppNotification({
                userId: options.userId,
                email: to,
                subject,
                eventType: options.eventType,
                actionUrl: options.actionUrl,
                actionLabel: options.actionLabel,
                priority: options.priority,
                category: options.category,
                payload: options.payload,
            });
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
        
        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'proposal.accepted',
            userId: data.userId,
            payload: data,
            actionUrl: '/roles',
            actionLabel: 'View Roles',
            priority: 'normal',
            category: 'proposal',
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
        
        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'proposal.declined',
            userId: data.userId,
            payload: data,
            actionUrl: '/roles',
            actionLabel: 'View Roles',
            priority: 'normal',
            category: 'proposal',
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
        
        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'proposal.timeout',
            userId: data.userId,
            payload: data,
            actionUrl: '/roles',
            actionLabel: 'View Roles',
            priority: 'low',
            category: 'proposal',
        });
    }
}
