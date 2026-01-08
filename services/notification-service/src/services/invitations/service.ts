/**
 * Invitations Email Service
 * Handles sending invitation emails via Resend
 */

import { Resend } from 'resend';
import { NotificationRepository } from '../../repository';
import { Logger } from '@splits-network/shared-logging';
import { teamInvitationEmail, invitationRevokedEmail } from '../../templates/invitations';

export class InvitationsEmailService {
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
                category: options.category || 'invitation',
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

    /**
     * Send invitation email to new team member
     */
    async sendInvitation(payload: {
        invitation_id: string;
        email: string;
        organization_name: string;
        role: string;
        invited_by_name: string;
        invitation_link: string;
        expires_at: string;
        userId?: string;
    }): Promise<void> {
        const { email, organization_name, role, invited_by_name, invitation_link, expires_at, userId } = payload;

        this.logger.info(
            { invitation_id: payload.invitation_id, email, organization_name },
            'Sending invitation email'
        );

        const roleLabel = this.getRoleLabel(role);
        const expiresDate = new Date(expires_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        const subject = `You've been invited to join ${organization_name} on Splits Network`;
        const html = teamInvitationEmail({
            organizationName: organization_name,
            role: roleLabel,
            invitedByName: invited_by_name,
            invitationLink: invitation_link,
            expiresDate: expiresDate,
        });

        try {
            await this.sendDualNotification(email, subject, html, {
                eventType: 'invitation.created',
                userId,
                payload: {
                    invitation_id: payload.invitation_id,
                    organization_name,
                    role,
                },
                actionUrl: '/portal/invitations',
                actionLabel: 'View Invitation',
                priority: 'high',
                category: 'invitation',
            });

            this.logger.info(
                { invitation_id: payload.invitation_id, email },
                'Invitation email sent successfully'
            );
        } catch (error) {
            this.logger.error(
                { error, invitation_id: payload.invitation_id, email },
                'Failed to send invitation email'
            );
            throw error;
        }
    }

    /**
     * Send invitation revoked email
     */
    async sendInvitationRevoked(payload: {
        email: string;
        organization_name: string;
        revoked_by_name?: string;
        userId?: string;
    }): Promise<void> {
        const { email, organization_name, revoked_by_name, userId } = payload;

        this.logger.info({ email, organization_name }, 'Sending invitation revoked email');

        const subject = `Invitation to ${organization_name} has been withdrawn`;
        const html = invitationRevokedEmail({
            organizationName: organization_name,
        });

        try {
            await this.sendDualNotification(email, subject, html, {
                eventType: 'invitation.revoked',
                userId,
                payload: {
                    organization_name,
                    revoked_by_name,
                },
                actionUrl: '/portal/invitations',
                actionLabel: 'View Invitations',
                priority: 'normal',
                category: 'invitation',
            });

            this.logger.info({ email, organization_name }, 'Revoked email sent successfully');
        } catch (error) {
            this.logger.error(
                { error, email, organization_name },
                'Failed to send revoked email'
            );
            // Don't throw - revocation already happened
        }
    }

    private getRoleLabel(role: string): string {
        const labels: Record<string, string> = {
            company_admin: 'Company Administrator',
            hiring_manager: 'Hiring Manager',
            recruiter: 'Recruiter',
        };
        return labels[role] || role;
    }
}
