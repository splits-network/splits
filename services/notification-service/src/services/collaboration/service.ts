import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';
import { collaboratorAddedEmail } from '../../templates/candidates';

export class CollaborationEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private logger: Logger
    ) { }

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
                category: options.category || 'collaboration',
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

    async sendCollaboratorAdded(
        recipientEmail: string,
        data: {
            candidateName: string;
            jobTitle: string;
            companyName: string;
            role: string;
            splitPercentage: number;
            roleId?: string;
            userId?: string;
        }
    ): Promise<void> {
        const subject = `Added to Placement Team: ${data.candidateName}`;
        const placementUrl = `${process.env.PORTAL_URL || 'https://splits.network'}/portal/placements`;
        const actionUrl = data.roleId ? `/portal/roles/${data.roleId}` : '/roles';

        const html = collaboratorAddedEmail({
            candidateName: data.candidateName,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            role: data.role,
            splitPercentage: data.splitPercentage,
            placementUrl,
        });

        await this.sendDualNotification(recipientEmail, subject, html, {
            eventType: 'collaborator.added',
            userId: data.userId,
            payload: data,
            actionUrl,
            actionLabel: 'View Role',
            priority: 'high',
            category: 'collaboration',
        });
    }
}
